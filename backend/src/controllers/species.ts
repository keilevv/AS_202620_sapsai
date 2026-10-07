import { Request, Response } from "express";
import { SpeciesService } from "../services/SpeciesService";

function SpeciesController() {
  const service = new SpeciesService();

  const getSpecies = async (req: Request, res: Response): Promise<void> => {
    try {
      const response = await service.getSpecies(req.query);
      res.json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  const createSpecies = async (req: Request, res: Response): Promise<void> => {
    try {
      const authUser = (req as any).user as { id?: string } | undefined;
      if (!authUser?.id) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const response = await service.createSpecies(authUser.id, req.body);
      res.status(201).json(response);
    } catch (error: any) {
      if (error.message.includes("are required")) res.status(400).json({ error: error.message });
      else if (error.message === "Species with this slug already exists") res.status(409).json({ error: error.message });
      else res.status(500).json({ error: "Internal server error" });
    }
  };

  const updateSpecies = async (req: Request, res: Response) => {
    try {
      const authUser = (req as any).user as { id?: string } | undefined;
      if (!authUser?.id) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const response = await service.updateSpecies(req.params.id, authUser.id, req.body);
      res.status(200).json(response);
    } catch (error: any) {
      if (error.message === "Unauthorized") res.status(401).json({ error: error.message });
      else if (error.message.includes("are required")) res.status(400).json({ error: error.message });
      else res.status(500).json({ error: "Internal server error" });
    }
  };

  const deleteSpecies = async (req: Request, res: Response) => {
    try {
      const authUser = (req as any).user as { id?: string } | undefined;
      if (!authUser?.id) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const response = await service.deleteSpecies(req.params.id, authUser.id);
      res.status(200).json(response);
    } catch (error: any) {
      if (error.message === "Unauthorized") res.status(401).json({ error: error.message });
      else if (error.message.includes("is required")) res.status(400).json({ error: error.message });
      else res.status(500).json({ error: "Internal server error" });
    }
  };

  return { getSpecies, createSpecies, updateSpecies, deleteSpecies };
}

export default SpeciesController;
