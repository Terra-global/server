import { Router } from "express";
import { adminController } from "./admin.controller";
import { authenticate } from "../../middleware/auth";
import { requireAdmin } from "../../middleware/admin";

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// Whitelist management
router.get("/whitelist", adminController.getWhitelist);
router.post("/whitelist", adminController.addToWhitelist);
router.delete("/whitelist/:email", adminController.removeFromWhitelist);

// User management
router.get("/users", adminController.listAllUsers);

export default router;
