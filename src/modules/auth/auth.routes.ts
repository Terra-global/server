import { Router } from "express";
import { authController } from "./auth.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google-login", authController.googleLogin);

// Protected route
router.get("/me", authenticate, authController.getMe);

export default router;
