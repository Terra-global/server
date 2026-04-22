import { Router } from "express";
import { homeController } from "./home.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

// Home feed — requires authentication
router.get("/", authenticate, homeController.getFeed);

export default router;
