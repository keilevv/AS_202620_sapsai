import { Router, Request, Response, NextFunction } from "express";
import userController from "../controllers/user";
import { authenticateToken } from "../middleware/auth";

const router = Router();

const controller = userController();
const { getUser, updateUser } = controller;

router.get("/:id", authenticateToken, getUser); // This now works ✅y

router.patch("/:id/update", authenticateToken, updateUser);

export default router;
