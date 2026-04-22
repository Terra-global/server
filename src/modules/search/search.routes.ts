import { Router } from "express";
import { searchController } from "./search.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

// Search is a protected action to prevent scraping
router.get("/", authenticate, searchController.search);

export default router;
