import { Request, Response } from "express";
import { UserService } from "../services/UserService";

function userController() {
  const service = new UserService();

  const getUser = async (req: Request, res: Response) => {
    try {
      const authUser = (req as any).user as { id?: string } | undefined;
      if (!authUser?.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const response = await service.getUser(req.params.id, authUser.id);
      return res.json(response);
    } catch (error: any) {
      if (error.message === "Forbidden") return res.status(403).json({ error: error.message });
      if (error.message === "User not found") return res.status(404).json({ error: error.message });
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  const updateUser = async (req: Request, res: Response) => {
    try {
      const authUser = (req as any).user as { id?: string } | undefined;
      if (!authUser?.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const response = await service.updateUser(req.params.id, authUser.id, req.body);
      return res.json(response);
    } catch (error: any) {
      if (error.message === "Forbidden") return res.status(403).json({ error: error.message });
      if (error.message === "User not found") return res.status(404).json({ error: error.message });
      if (error.message.includes("Missing required field")) return res.status(400).json({ error: error.message });
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  return { getUser, updateUser };
}

export default userController;
