import { Router } from "express";
import speciesController from "../controllers/species";
import { authenticateToken } from "../middleware/auth";

const router = Router();
const controller = speciesController();
const { getSpecies, createSpecies, updateSpecies, deleteSpecies } = controller;
router.get("/", authenticateToken, getSpecies);
router.post("/", authenticateToken, createSpecies);
router.patch("/admin/:id/update", authenticateToken, updateSpecies);
router.delete("/admin/:id/delete", authenticateToken, deleteSpecies);

export default router;
