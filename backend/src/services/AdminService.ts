import { AdminRepository } from "../repositories/AdminRepository";
import { R2Service } from "./r2Service";
import { sanitizeUser } from "../utils";
import { baseShapes } from "../config";
import bcrypt from "bcryptjs";
import {
  GetClassificationsAdminQuery,
  UpdateClassificationAdminDto,
  GetUsersAdminQuery,
  UpdateUserAdminDto,
} from "../dto/AdminDto";

export class AdminService {
  private adminRepo = new AdminRepository();

  async getClassifications(query: GetClassificationsAdminQuery) {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";
    const searchQuery = query.search || "";
    const status = query.status || "ALL";
    const isArchived = query.isArchived || "false";

    const where: any = {};

    if (status !== "ALL") {
      where.status = status;
    }

    if (isArchived === "true") {
      where.isArchived = true;
    } else if (isArchived === "false" || isArchived === "undefined") {
      where.isArchived = false;
    }

    if (query.createdAt_gte || query.createdAt_lte) {
      where.createdAt = {};
      if (query.createdAt_gte) where.createdAt.gte = new Date(query.createdAt_gte);
      if (query.createdAt_lte) where.createdAt.lte = new Date(query.createdAt_lte);
    }

    if (searchQuery) {
      where.OR = [
        { shape: { contains: searchQuery, mode: "insensitive" } },
        { species: { contains: searchQuery, mode: "insensitive" } },
        { originalFilename: { contains: searchQuery, mode: "insensitive" } },
        { user: { is: { fullName: { contains: searchQuery, mode: "insensitive" } } } },
        { user: { is: { email: { contains: searchQuery, mode: "insensitive" } } } },
      ];
    }

    const [classifications, count, totalVerifiedCount, totalPendingCount, totalArchivedCount] = await Promise.all([
      this.adminRepo.findManyClassifications(where, { [sortBy]: sortOrder }, skip, limit),
      this.adminRepo.countClassifications(where),
      this.adminRepo.countClassifications({ ...where, status: "VERIFIED", isArchived: false }),
      this.adminRepo.countClassifications({ ...where, status: "PENDING", isArchived: false }),
      this.adminRepo.countClassifications({ ...where, isArchived: true }),
    ]);

    const classificationsWithUser = classifications.map((classification) => ({
      ...classification,
      user: classification.user ? sanitizeUser(classification.user) : undefined,
    }));

    return {
      count,
      pages: Math.ceil(count / limit),
      totalVerifiedCount,
      totalPendingCount,
      totalArchivedCount,
      results: classificationsWithUser,
      shapes: baseShapes,
    };
  }

  async getClassification(id: string) {
    const classification = await this.adminRepo.findUniqueClassification(id);
    if (!classification) throw new Error("Classification not found");
    return {
      message: "Classification fetched successfully",
      results: { ...classification },
    };
  }

  async updateClassification(id: string, actingUserRole: string, dto: UpdateClassificationAdminDto) {
    const classificationToUpdate = await this.adminRepo.findUniqueClassification(id);
    if (!classificationToUpdate) throw new Error("Classification not found");

    const hasStatus = typeof dto.status !== "undefined" && dto.status !== null && dto.status !== "";
    if (hasStatus && dto.status === "VERIFIED" && actingUserRole !== "ADMIN") {
      throw new Error("Only ADMIN can set status to VERIFIED");
    }

    const tagsChanged = typeof dto.taggedSpecies !== "undefined" || typeof dto.taggedShape !== "undefined" || typeof dto.taggedHealthy !== "undefined";
    const currentStatus = classificationToUpdate.status;
    const shouldUnverify = !hasStatus || (hasStatus && dto.status !== "VERIFIED");

    let splitName: string[] | undefined;
    let fileName: string | undefined;
    let fileStructure: string[] | undefined;
    let finalNewImagePath: string | undefined;

    if (hasStatus || (tagsChanged && shouldUnverify)) {
      splitName = classificationToUpdate.imagePath.split("/");
      fileName = splitName[splitName.length - 1];
      fileStructure = fileName.split("_");
    }

    if (hasStatus && dto.status === "VERIFIED") {
      if (classificationToUpdate.status !== "VERIFIED" && splitName?.length) {
        const newSpecies = dto.taggedSpecies || classificationToUpdate.taggedSpecies;
        const newShape = dto.taggedShape || classificationToUpdate.taggedShape;
        const newHealth = dto.taggedHealthy !== undefined ? (dto.taggedHealthy ? "healthy" : "deseased") : (classificationToUpdate.taggedHealthy ? "healthy" : "deseased");

        fileStructure![0] = newSpecies!;
        fileStructure![1] = newHealth;
        fileStructure![2] = newShape!;
        fileStructure![3] = "verified";

        const newFileName = fileStructure!.join("_");
        splitName[splitName.length - 1] = newFileName;
        let newImagePath = splitName.join("/");

        if (classificationToUpdate.imagePath.startsWith("http")) {
          const rename = await R2Service.renameObject(fileName!, newFileName);
          if (!rename.success) throw new Error(rename.error || "Failed to rename object in storage");
          newImagePath = rename.url!;
        }
        finalNewImagePath = newImagePath;
      }
    } else if (hasStatus || (tagsChanged && shouldUnverify)) {
      if (splitName?.length && fileStructure) {
        const newSpecies = (typeof dto.taggedSpecies !== "undefined" ? dto.taggedSpecies : classificationToUpdate.taggedSpecies) as string;
        const newShape = (typeof dto.taggedShape !== "undefined" ? dto.taggedShape : classificationToUpdate.taggedShape) as string;
        const newHealth = typeof dto.taggedHealthy !== "undefined" ? (dto.taggedHealthy ? "healthy" : "deseased") : (classificationToUpdate.taggedHealthy ? "healthy" : "deseased");

        fileStructure[0] = newSpecies;
        fileStructure[1] = newHealth;
        fileStructure[2] = newShape;
        fileStructure[3] = "unverified";

        const newFileName = fileStructure.join("_");
        splitName[splitName.length - 1] = newFileName;

        if (newFileName !== fileName) {
          let newImagePath = splitName.join("/");
          if (classificationToUpdate.imagePath.startsWith("http")) {
            const rename = await R2Service.renameObject(fileName!, newFileName);
            if (!rename.success) throw new Error(rename.error || "Failed to rename object in storage");
            newImagePath = rename.url!;
          }
          finalNewImagePath = newImagePath;
        }
      }
    }

    const updateData: any = {
      taggedShape: dto.taggedShape,
      taggedSpecies: dto.taggedSpecies,
      taggedHealthy: dto.taggedHealthy,
      isArchived: dto.isArchived,
    };

    if (hasStatus) updateData.status = dto.status;
    else if (tagsChanged && currentStatus === "VERIFIED") updateData.status = "PENDING";
    
    if (finalNewImagePath && finalNewImagePath !== classificationToUpdate.imagePath) {
      updateData.imagePath = finalNewImagePath;
    }

    const classification = await this.adminRepo.updateClassification(id, updateData);
    return { message: "Classification updated successfully", results: { ...classification } };
  }

  async deleteClassification(id: string) {
    const classification = await this.adminRepo.deleteClassification(id);
    return { message: "Classification deleted successfully", results: classification };
  }

  async getUsers(query: GetUsersAdminQuery) {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";
    const searchQuery = query.search || "";
    const role = query.role || "ALL";
    const isArchived = query.isArchived || "false";

    const where: any = {};
    if (role !== "ALL") where.role = role;
    if (isArchived === "true") where.isArchived = true;
    else if (isArchived === "false" || isArchived === "undefined") where.isArchived = false;

    if (query.createdAt_gte || query.createdAt_lte) {
      where.createdAt = {};
      if (query.createdAt_gte) where.createdAt.gte = new Date(query.createdAt_gte);
      if (query.createdAt_lte) where.createdAt.lte = new Date(query.createdAt_lte);
    }

    if (searchQuery) {
      where.OR = [
        { email: { contains: searchQuery, mode: "insensitive" } },
        { fullName: { contains: searchQuery, mode: "insensitive" } },
      ];
    }

    if (typeof query.requestedContributorStatus !== "undefined") {
      where.requestedContributorStatus = query.requestedContributorStatus === "true";
    }

    const [users, count, requestedContributorCount] = await Promise.all([
      this.adminRepo.findManyUsers(where, { [sortBy]: sortOrder }, skip, limit),
      this.adminRepo.countUsers(where),
      this.adminRepo.countUsers({ role: "USER", requestedContributorStatus: true }),
    ]);

    const usersWithCounts = users.map((user) => ({
      ...sanitizeUser(user as any),
      classificationCount: (user as any)._count?.classifications ?? 0,
    }));

    return { count, requestedContributorCount, pages: Math.ceil(count / limit), results: usersWithCounts };
  }

  async getUser(id: string) {
    const user = await this.adminRepo.findUniqueUser(id);
    if (!user) throw new Error("User not found");
    return {
      message: "User fetched successfully",
      results: sanitizeUser(user as any),
      classificationCount: (user as any)._count?.classifications ?? 0,
    };
  }

  async updateUser(id: string, dto: UpdateUserAdminDto) {
    const data: any = {
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      institution: dto.institution,
      department: dto.department,
      location: dto.location,
      bio: dto.bio,
      emailNotifications: dto.emailNotifications,
      role: dto.role,
      isArchived: dto.isArchived,
      requestedContributorStatus: dto.requestedContributorStatus,
    };

    if (dto.password && dto.password.trim().length > 0) {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const updatedUser = await this.adminRepo.updateUser(id, data);
    return { user: sanitizeUser(updatedUser) };
  }
}
