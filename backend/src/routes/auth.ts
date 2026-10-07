import { Router, Request, Response, NextFunction } from "express";
import authController from "../controllers/auth";

const router = Router();

const controller = authController();
const {
  googleLogin,
  googleCallback,
  localLogin,
  localRegister,
  logout,
  isAuthenticated,
  refreshToken,
} = controller;

router.get("/google", googleLogin); // This now works ✅

router.get("/google/callback", ...googleCallback); // Spread the middleware array ✅

router.post("/login", localLogin); // Spread if it's also an array

router.post("/register", localRegister);

router.get("/logout", logout);

router.get("/me", isAuthenticated);

router.post("/refresh-token", (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(refreshToken(req, res)).catch(next);
});

export default router;
