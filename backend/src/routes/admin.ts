import { Router } from "express";
import admincontroller from "../controllers/admin";
import { authenticateToken } from "../middleware/auth";

const router = Router();
const controller = admincontroller();
const {
  getClassificationsAdmin,
  getUsersAdmin,
  getClassificationAdmin,
  updateClassificationAdmin,
  getUserAdmin,
  updateUserAdmin,
  deleteClassificationAdmin,
} = controller;
router.get("/classifications", authenticateToken, getClassificationsAdmin);
router.get("/classification/:id", authenticateToken, getClassificationAdmin);
router.put("/classification/:id", authenticateToken, updateClassificationAdmin);
router.delete(
  "/classification/:id",
  authenticateToken,
  deleteClassificationAdmin
);
router.get("/users", authenticateToken, getUsersAdmin);
router.get("/user/:id", authenticateToken, getUserAdmin);
router.put("/user/:id", authenticateToken, updateUserAdmin);

export default router;
