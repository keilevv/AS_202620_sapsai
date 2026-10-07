import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import controller from "../controllers/plantClassifier";
import bodyParser from "body-parser";
import { authenticateToken } from "../middleware/auth";

const {
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
} = controller();

const router = express.Router();

const upload = multer({ dest: "./uploads" });

router.post(
  "/upload",
  authenticateToken,
  bodyParser.json(),
  upload.single("image"),
  uploadImage
);
router.get("/upload/:id", authenticateToken, getUpload);
router.get("/classifications", authenticateToken, getClassifications);
router.patch("/classifications/:id", authenticateToken, updateClassification);

// Model management endpoints
router.get("/models", authenticateToken, listModels);
router.get(
  "/models/:model/versions",
  authenticateToken,
  getModelVersions
);
router.get(
  "/models/:model/versions/:version",
  authenticateToken,
  getModelVersionInfo
);
router.post(
  "/models/:model/versions/:version/restore",
  authenticateToken,
  restoreModelVersion
);
router.get("/retrain/preview", authenticateToken, getRetrainPreview);
router.post("/retrain/:model", authenticateToken, retrainModel);
router.get("/retrain/:model/status", authenticateToken, getTrainingStatus);
router.get("/retrain/:model/metrics", authenticateToken, getMetrics);

export default router;
