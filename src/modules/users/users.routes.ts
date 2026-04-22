import { Router } from "express";
import { usersController } from "./users.controller";
import { authenticate, optionalAuthenticate } from "../../middleware/auth";

const router = Router();

// Public routes
router.get("/farm-types", usersController.getFarmTypes);
router.get("/profile/:id", optionalAuthenticate, usersController.getProfile);

// Protected routes
router.patch("/profile", authenticate, usersController.updateProfile);
router.post("/follow/:id", authenticate, usersController.toggleFollow);

export default router;
