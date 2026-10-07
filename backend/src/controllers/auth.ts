import passport from "passport";
import { Request, Response, NextFunction } from "express";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { sanitizeUser } from "../utils";
import { AuthService } from "../services/AuthService";

const frontendUrl = process.env.FRONTEND_URL || "http://plantai.lab.utb.edu.co";

function authController() {
  const authService = new AuthService();

  const googleLogin = (req: Request, res: Response, next: NextFunction) => {
    const redirectTo = req.query.redirectTo || "/upload";
    const state = Buffer.from(JSON.stringify({ redirectTo })).toString("base64");

    const authenticator = passport.authenticate("google", {
      scope: ["profile", "email"],
      state: state,
    });

    authenticator(req, res, next);
  };

  const googleCallback = [
    passport.authenticate("google", {
      failureRedirect: "/login",
      failureMessage: true,
    }),
    (req: Request, res: Response) => {
      try {
        const state = req.query.state as string;
        let redirectPath = "/upload";
        if (state) {
          const decodedState = JSON.parse(Buffer.from(state, "base64").toString());
          if (decodedState.redirectTo) {
            redirectPath = decodedState.redirectTo;
          }
        }
        const user = req.user as any;
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        const redirectUrl = `${frontendUrl}${redirectPath}?accessToken=${accessToken}&refreshToken=${refreshToken}`;
        return res.redirect(redirectUrl);
      } catch (error) {
        console.error("Error processing callback:", error);
        res.redirect(`${frontendUrl}/upload`);
      }
    },
  ];

  const localLogin = async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(400).json({
          message: "Login failed",
          error: info?.message || "Login failed",
        });
      }

      req.logIn(user, (err) => {
        if (err) return next({ message: "Login failed", error: err });
        const accessToken = generateAccessToken(user);
        res.json({
          message: "Login successful",
          user: sanitizeUser(user),
          accessToken,
        });
      });
    })(req, res, next);
  };

  const localRegister = async (req: Request, res: Response) => {
    try {
      const { user, accessToken, refreshToken } = await authService.register(req.body);

      req.login(user, (err) => {
        if (err) {
          return res.status(500).send({ status: "error", message: "Login failed", error: err });
        }
        res.status(200).send({
          status: "success",
          message: "Registration successful",
          user: sanitizeUser(user),
          accessToken,
        });
      });
    } catch (error: any) {
      if (error.message === "User already exists") {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Registration failed" });
    }
  };

  const logout = (req: Request, res: Response) => {
    req.logout(() => res.send("Logged out"));
  };

  const isAuthenticated = (req: Request, res: Response, _next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Not logged in" });
    const accessToken = generateAccessToken(req.user as any);
    res.json({ user: sanitizeUser(req.user), accessToken });
  };

  const refreshToken = async (req: Request, res: Response) => {
    try {
      const tokens = await authService.refreshToken(req.body.refreshToken);
      return res.json(tokens);
    } catch (error: any) {
      if (error.message === "No refresh token provided") return res.status(400).json({ error: error.message });
      if (error.message === "User not found") return res.status(401).json({ error: error.message });
      return res.status(401).json({ error: "Invalid or expired refresh token" });
    }
  };

  return {
    googleLogin,
    googleCallback,
    localLogin,
    localRegister,
    logout,
    isAuthenticated,
    refreshToken,
  };
}

export default authController;
