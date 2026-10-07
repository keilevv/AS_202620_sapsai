import { Response, NextFunction } from "express";
import { PlantClassifierService } from "../services/PlantClassifierService";
import prisma from "../lib/prisma"; // Keeping it for simple user fetches if necessary, or we can use a repository in the service.

function plantClassifierController() {
  const service = new PlantClassifierService();

  const uploadImage = async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.user)
        return res.status(401).json({ error: "Authentication required" });
      const userId = req.user.id;
      const actingUser = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!actingUser)
        return res.status(401).json({ error: "Authentication required" });
      if (!req.file)
        return res.status(400).json({ error: "No image uploaded" });

      const response = await service.uploadImage(userId, req.file);
      return res.status(200).json(response);
    } catch (error: any) {
      if (error.message === "Image is not a plant")
        return res
          .status(400)
          .json({ error: "no_plant", message: error.message });
      return res
        .status(500)
        .json({ error: error.message || "Internal server error" });
    }
  };

  const getClassifications = async (req: any, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      const actingUser = await prisma.user.findUnique({
        where: { id: req.user.id },
      });
      const response = await service.getClassifications(req.query, actingUser);
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch classifications" });
    }
  };

  const getUpload = async (req: any, res: Response): Promise<Response> => {
    try {
      if (!req.user)
        return res.status(401).json({ error: "Authentication required" });
      const result = await service.getUpload(req.params.id, req.user.id);
      return res.status(200).json({ result });
    } catch (error: any) {
      if (error.message === "Upload not found")
        return res.status(404).json({ error: error.message });
      if (error.message === "Forbidden")
        return res.status(403).json({ error: error.message });
      return res.status(500).json({ error: "Failed to fetch upload" });
    }
  };

  const updateClassification = async (req: any, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      const response = await service.updateClassification(
        req.params.id,
        req.user.id,
        req.body,
      );
      res.json(response);
    } catch (error: any) {
      if (error.message === "Classification not found")
        res.status(404).json({ error: error.message });
      else if (error.message === "Unauthorized")
        res.status(403).json({ error: error.message });
      else
        res
          .status(500)
          .json({
            error: "Failed to update classification",
            message: error.message,
          });
    }
  };

  const listModels = async (req: any, res: Response) => {
    try {
      res.json(service.listModels());
    } catch (error) {
      res.status(500).json({ error: "Failed to list models" });
    }
  };

  const getModelVersions = async (req: any, res: Response) => {
    try {
      const model = (req.params.model as string) || (req.query.model as string);
      const response = await service.getModelVersions(model);
      return res.status(200).json(response);
    } catch (error: any) {
      if (error.message.includes("Invalid"))
        return res.status(400).json({ error: error.message });
      return res
        .status(500)
        .json({ error: error.message || "Failed to fetch versions" });
    }
  };

  const getModelVersionInfo = async (req: any, res: Response) => {
    try {
      const response = await service.getModelVersionInfo(
        req.params.model,
        req.params.version,
      );
      return res.status(200).json(response);
    } catch (error: any) {
      if (
        error.message.includes("Invalid") ||
        error.message.includes("Missing")
      )
        return res.status(400).json({ error: error.message });
      return res
        .status(500)
        .json({ error: error.message || "Failed to fetch version info" });
    }
  };

  const restoreModelVersion = async (req: any, res: Response) => {
    try {
      if (!req.user)
        return res.status(401).json({ error: "Authentication required" });
      const actingUser = await prisma.user.findUnique({
        where: { id: req.user.id },
      });
      const response = await service.restoreModelVersion(
        req.params.model,
        req.params.version,
        actingUser?.role || "",
      );
      return res.status(200).json(response);
    } catch (error: any) {
      if (error.message === "Unauthorized")
        return res.status(403).json({ error: error.message });
      if (
        error.message.includes("Invalid") ||
        error.message.includes("Missing")
      )
        return res.status(400).json({ error: error.message });
      return res
        .status(500)
        .json({ error: error.message || "Failed to restore model version" });
    }
  };

  const retrainModel = async (req: any, res: Response) => {
    try {
      if (!req.user)
        return res.status(401).json({ error: "Authentication required" });
      const actingUser = await prisma.user.findUnique({
        where: { id: req.user.id },
      });
      const model = (req.params.model as string) || (req.query.model as string);
      const response = await service.retrainModel(
        model,
        actingUser?.role || "",
      );
      return res.status(200).json(response);
    } catch (error: any) {
      if (error.message === "Unauthorized")
        return res.status(403).json({ error: error.message });
      if (error.message.includes("Invalid"))
        return res.status(400).json({ error: error.message });
      if (error.response?.status === 409)
        return res
          .status(409)
          .json({
            error: error.response.data.detail || "Training already in progress",
          });
      return res
        .status(500)
        .json({ error: error.message || "Failed to start retraining" });
    }
  };

  const getTrainingStatus = async (req: any, res: Response) => {
    try {
      if (!req.user)
        return res.status(401).json({ error: "Authentication required" });
      const actingUser = await prisma.user.findUnique({
        where: { id: req.user.id },
      });
      const model = (req.params.model as string) || (req.query.model as string);
      const response = await service.getTrainingStatus(
        model,
        actingUser?.role || "",
      );
      return res.status(200).json(response);
    } catch (error: any) {
      if (error.message === "Unauthorized")
        return res.status(403).json({ error: error.message });
      if (error.message.includes("Invalid"))
        return res.status(400).json({ error: error.message });
      return res
        .status(500)
        .json({ error: error.message || "Failed to get training status" });
    }
  };

  const getRetrainPreview = async (req: any, res: Response) => {
    try {
      if (!req.user)
        return res.status(401).json({ error: "Authentication required" });
      const actingUser = await prisma.user.findUnique({
        where: { id: req.user.id },
      });
      const model = (req.params.model as string) || (req.query.model as string);
      console.log("model", model);
      const response = await service.getRetrainPreview(
        model,
        actingUser?.role || "",
      );
      return res.status(200).json(response);
    } catch (error: any) {
      if (error.message === "Unauthorized")
        return res.status(403).json({ error: error.message });
      if (error.message.includes("Invalid"))
        return res.status(400).json({ error: error.message });
      return res
        .status(500)
        .json({ error: error.message || "Failed to get retrain preview" });
    }
  };

  const getMetrics = async (req: any, res: Response) => {
    try {
      if (!req.user)
        return res.status(401).json({ error: "Authentication required" });
      const actingUser = await prisma.user.findUnique({
        where: { id: req.user.id },
      });
      const model = (req.params.model as string) || (req.query.model as string);
      const response = await service.getMetrics(
        model,
        actingUser?.role || "",
      );
      return res.status(200).json(response);
    } catch (error: any) {
      if (error.message === "Unauthorized")
        return res.status(403).json({ error: error.message });
      if (error.message.includes("Invalid"))
        return res.status(400).json({ error: error.message });
      if (error.response?.status === 404)
        return res.status(404).json({ error: error.response.data.detail || "Metrics not found" });
      return res
        .status(500)
        .json({ error: error.message || "Failed to get metrics" });
    }
  };

  return {
    uploadImage,
    getClassifications,
    updateClassification,
    getUpload,
    listModels,
    getModelVersions,
    getModelVersionInfo,
    restoreModelVersion,
    retrainModel,
    getTrainingStatus,
    getRetrainPreview,
    getMetrics,
  };
}

export default plantClassifierController;
