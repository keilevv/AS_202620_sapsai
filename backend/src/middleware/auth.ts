import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = (authHeader && authHeader.split(" ")[1]) || (req.query.token as string);

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = verifyAccessToken(token);
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
