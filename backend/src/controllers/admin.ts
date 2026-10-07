import prisma from "../lib/prisma";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types";
import { AdminService } from "../services/AdminService";

function adminController() {
  const adminService = new AdminService();

  const getClassificationsAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      const actingUser = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (actingUser?.role !== "ADMIN" && actingUser?.role !== "MODERATOR") {
        res.status(403).json({ error: "Unauthorized" });
        return;
      }

      const response = await adminService.getClassifications(req.query);
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch classifications", message: error.message });
    }
  };

  const getClassificationAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      const actingUser = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (actingUser?.role !== "ADMIN" && actingUser?.role !== "MODERATOR") {
        res.status(403).json({ error: "Unauthorized" });
        return;
      }

      const response = await adminService.getClassification(req.params.id);
      res.json(response);
    } catch (error: any) {
      if (error.message === "Classification not found") {
        res.status(404).json({ error: "Classification not found" });
      } else {
        res.status(500).json({ error: "Failed to fetch classification", message: error.message });
      }
    }
  };

  const updateClassificationAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      const actingUser = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (actingUser?.role !== "ADMIN" && actingUser?.role !== "MODERATOR") {
        res.status(403).json({ error: "Unauthorized" });
        return;
      }

      const response = await adminService.updateClassification(req.params.id, actingUser.role, req.body);
      res.json(response);
    } catch (error: any) {
      if (error.message === "Classification not found") res.status(404).json({ error: error.message });
      else if (error.message === "Only ADMIN can set status to VERIFIED") res.status(403).json({ error: error.message });
      else res.status(500).json({ error: "Failed to update classification", message: error.message });
    }
  };

  const deleteClassificationAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      const actingUser = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (actingUser?.role !== "ADMIN") {
        res.status(403).json({ error: "Unauthorized" });
        return;
      }

      const response = await adminService.deleteClassification(req.params.id);
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to delete classification", message: error.message });
    }
  };

  const getUsersAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      const actingUser = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (actingUser?.role !== "ADMIN" && actingUser?.role !== "MODERATOR") {
        res.status(403).json({ error: "Unauthorized" });
        return;
      }

      const response = await adminService.getUsers(req.query);
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch users", message: error.message });
    }
  };

  const getUserAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      const adminUser = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!adminUser || (adminUser.role !== "ADMIN" && adminUser.role !== "MODERATOR")) {
        res.status(403).json({ error: "Unauthorized" });
        return;
      }

      const response = await adminService.getUser(req.params.id);
      res.json(response);
    } catch (error: any) {
      if (error.message === "User not found") res.status(404).json({ error: error.message });
      else res.status(500).json({ error: "Failed to fetch user", message: error.message });
    }
  };

  const updateUserAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const authUser = (req as any).user as { id?: string } | undefined;
      if (!authUser?.id) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      
      if (authUser.id !== id) {
        const actingUser = await prisma.user.findUnique({ where: { id: authUser.id } });
        if (!actingUser || actingUser.role !== "ADMIN") {
          res.status(403).json({ error: "Forbidden" });
          return;
        }
      }

      const response = await adminService.updateUser(id, req.body);
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ error: "Internal server error" });
    }
  };

  return {
    getUsersAdmin,
    getClassificationsAdmin,
    getClassificationAdmin,
    updateClassificationAdmin,
    deleteClassificationAdmin,
    getUserAdmin,
    updateUserAdmin,
  };
}

export default adminController;
