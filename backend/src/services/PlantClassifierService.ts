import path from "path";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import { R2Service } from "./r2Service";
import { v4 as uuidv4 } from "uuid";
import { sanitizeUser } from "../utils";
import { baseShapes } from "../config";
import { ClassificationRepository } from "../repositories/ClassificationRepository";
import { GetClassificationsQuery, UpdateClassificationDto } from "../dto/PlantClassifierDto";

const classifierServiceUrl = process.env.CLASSIFY_SERVICE_URL || "http://localhost:8000/";

export class PlantClassifierService {
  private classificationRepo = new ClassificationRepository();

  async uploadImage(userId: string, image: Express.Multer.File) {
    const uniqueTempName = `${uuidv4()}_${image.originalname}`;
    const uploadPath = path.join(process.cwd(), "uploads", uniqueTempName);

    fs.renameSync(image.path, uploadPath);

    if (!fs.existsSync(uploadPath)) {
      throw new Error(`File not found at ${uploadPath}`);
    }

    try {
      const formData = new FormData();
      formData.append("image", fs.createReadStream(uploadPath), image.originalname);

      let response;
      try {
        response = await axios.post(`${classifierServiceUrl}/predict`, formData, {
          headers: { ...formData.getHeaders() },
        });
      } catch (error: any) {
        console.error(`[Classifier Service] FAILED: ${error.message}`);
        throw new Error(`Classifier service error: ${error.message}`);
      }

      const { model1, model2, model3 } = response.data;

      if (!model3.class_name || model3.class_name !== "True") {
        fs.unlinkSync(uploadPath);
        throw new Error("Image is not a plant");
      }

      const species = model1.class_name.split("_")[0];
      const taggedSpecies = species;
      const isHealthy = model1.class_name.includes("healthy");
      const taggedHealthy = isHealthy;
      const species_confidence = model1.probability;
      const shape = model2.class_name;
      const taggedShape = shape;
      const shape_confidence = model2.probability;
      const health = isHealthy ? "healthy" : "deseased";

      const fileName = `${species}_${health}_${shape}_unverified_`;
      const uniqueId = uuidv4().replace(/-/g, "").substring(0, 8);
      const fileExtension = path.extname(image.originalname);

      const r2Key = R2Service.generateImageKey(fileName, uniqueId, fileExtension);

      console.log(`[R2 Upload] Starting upload for key: ${r2Key}, mimetype: ${image.mimetype}`);
      
      let uploadResult: any = { success: false };
      try {
        uploadResult = await R2Service.uploadFile(uploadPath, r2Key, image.mimetype);
      } catch (err: any) {
        uploadResult = { success: false, error: err.message || String(err) };
      }

      let finalImagePath: string;
      let imageUrl: string;

      if (!uploadResult.success) {
        if (uploadResult.error?.includes("too small") || uploadResult.error?.includes("EntityTooSmall") || R2Service.isFileTooSmall(uploadPath)) {
          console.warn(`[R2 Upload] File too small for R2, failing back to local storage: ${r2Key}`);
          const localPath = `uploads/${r2Key}`;
          const localUploadPath = path.join(process.cwd(), localPath);

          const uploadsDir = path.join(process.cwd(), "uploads");
          if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

          fs.copyFileSync(uploadPath, localUploadPath);
          finalImagePath = localPath;
          imageUrl = `/uploads/${r2Key}`;
        } else {
          console.error(`[R2 Upload] FAILED for key: ${r2Key}. Error: ${uploadResult.error}`);
          fs.unlinkSync(uploadPath);
          throw new Error(`Error uploading to R2: ${uploadResult.error}`);
        }
      } else {
        console.log(`[R2 Upload] SUCCESS: ${r2Key} -> ${uploadResult.url}`);
        finalImagePath = r2Key;
        imageUrl = uploadResult.url!;
      }

      const matchingSpecies = await this.classificationRepo.findSpeciesBySlug(species);

      const classificationEntry = await this.classificationRepo.createClassification({
        originalFilename: image.originalname,
        imagePath: imageUrl,
        species,
        shape,
        taggedSpecies,
        taggedShape,
        taggedHealthy,
        speciesConfidence: species_confidence,
        shapeConfidence: shape_confidence,
        commonNameEn: matchingSpecies?.commonNameEn,
        commonNameEs: matchingSpecies?.commonNameEs,
        scientificName: matchingSpecies?.scientificName,
        isHealthy,
        userId,
      });

      fs.unlinkSync(uploadPath);

      return {
        message: "Image uploaded and classified successfully",
        classification: classificationEntry,
        storageType: uploadResult.success ? "R2" : "local",
        imageUrl,
      };

    } catch (classificationError: any) {
      if (fs.existsSync(uploadPath)) fs.unlinkSync(uploadPath);
      throw classificationError;
    }
  }

  async getClassifications(query: GetClassificationsQuery, actingUser: any) {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";

    const where: any = {};

    if (query.status && query.status !== "ALL") where.status = query.status;

    if (actingUser?.role === "ADMIN" && query.userId) {
      where.userId = query.userId;
    } else {
      where.userId = actingUser.id;
    }

    if (typeof query.isArchived !== "undefined") {
      where.isArchived = query.isArchived === "true";
    } else {
      where.isArchived = false;
    }

    if (typeof query.isHealthy !== "undefined") {
      where.isHealthy = query.isHealthy === "true";
    }

    if (query.classification) where.classification = query.classification;

    if (query.originalFilename) {
      where.originalFilename = { contains: query.originalFilename as string, mode: "insensitive" };
    }

    if (query.createdAt_gte || query.createdAt_lte) {
      where.createdAt = {};
      if (query.createdAt_gte) where.createdAt.gte = new Date(query.createdAt_gte);
      if (query.createdAt_lte) where.createdAt.lte = new Date(query.createdAt_lte);
    }

    if (query.search) {
      where.OR = [
        { originalFilename: { contains: query.search, mode: "insensitive" } },
        { species: { contains: query.search, mode: "insensitive" } },
        { shape: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [classifications, count] = await Promise.all([
      this.classificationRepo.findManyClassifications(where, { [sortBy]: sortOrder }, skip, limit),
      this.classificationRepo.countClassifications(where),
    ]);

    const classificationsWithUser = classifications.map((classification) => ({
      ...classification,
      user: (classification as any).user ? sanitizeUser((classification as any).user) : undefined,
    }));

    return {
      count,
      pages: Math.ceil(count / limit),
      results: classificationsWithUser,
      shapes: baseShapes,
    };
  }

  async getUpload(id: string, userId: string) {
    const upload = await this.classificationRepo.findUniqueClassification(id);
    if (!upload) throw new Error("Upload not found");
    if (upload.userId !== userId) throw new Error("Forbidden");
    return upload;
  }

  async updateClassification(id: string, userId: string, dto: UpdateClassificationDto) {
    const existing = await this.classificationRepo.findUniqueClassification(id);
    if (!existing) throw new Error("Classification not found");
    if (existing.userId !== userId) throw new Error("Unauthorized");

    const classification = await this.classificationRepo.updateClassification(id, {
      taggedShape: dto.taggedShape,
      taggedSpecies: dto.taggedSpecies,
      taggedHealthy: dto.taggedHealthy,
      isArchived: dto.isArchived,
    });

    return { message: "Classification updated successfully", results: { ...classification } };
  }

  availableModels = ["especies", "hojas", "plantas"];

  listModels() {
    return { models: this.availableModels };
  }

  async getModelVersions(model: string) {
    if (!model || !this.availableModels.includes(model)) throw new Error("Invalid or missing model. Use especies|hojas|plantas");
    const response = await axios.get(`${classifierServiceUrl}/retrain/versions`, { params: { model } });
    return response.data;
  }

  async getModelVersionInfo(model: string, version: string) {
    if (!model || !this.availableModels.includes(model)) throw new Error("Invalid or missing model. Use especies|hojas|plantas");
    if (!version) throw new Error("Missing version");
    const response = await axios.get(`${classifierServiceUrl}/retrain/version-info`, { params: { model, version } });
    return response.data;
  }

  async restoreModelVersion(model: string, version: string, role: string) {
    if (role !== "ADMIN") throw new Error("Unauthorized");
    if (!model || !this.availableModels.includes(model)) throw new Error("Invalid or missing model. Use especies|hojas|plantas");
    if (!version) throw new Error("Missing version");
    const response = await axios.post(`${classifierServiceUrl}/retrain/restore-version`, undefined, { params: { model, version } });
    return response.data;
  }

  async retrainModel(model: string, role: string) {
    if (role !== "ADMIN") throw new Error("Unauthorized");
    if (!model || !this.availableModels.includes(model)) throw new Error("Invalid or missing model. Use especies|hojas|plantas");
    const response = await axios.post(`${classifierServiceUrl}/retrain`, undefined, { params: { model } });
    return response.data;
  }

  async getTrainingStatus(model: string, role: string) {
    if (role !== "ADMIN") throw new Error("Unauthorized");
    if (!model || !this.availableModels.includes(model)) throw new Error("Invalid or missing model. Use especies|hojas|plantas");
    const response = await axios.get(`${classifierServiceUrl}/retrain/status`, { params: { model } });
    return response.data;
  }

  async getRetrainPreview(model: string, role: string) {
    if (role !== "ADMIN") throw new Error("Unauthorized");
    if (!model || !this.availableModels.includes(model)) throw new Error("Invalid or missing model. Use especies|hojas|plantas");
    const response = await axios.get(`${classifierServiceUrl}/retrain/preview`, { params: { model } });
    return response.data;
  }

  async getMetrics(model: string, role: string) {
    if (role !== "ADMIN") throw new Error("Unauthorized");
    if (!model || !this.availableModels.includes(model)) throw new Error("Invalid or missing model. Use especies|hojas|plantas");
    const response = await axios.get(`${classifierServiceUrl}/retrain/metrics`, { params: { model } });
    return response.data;
  }
}
