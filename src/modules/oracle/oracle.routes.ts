import { Router } from "express";
import { getWeather, getCropData, getAnimalData, getTargetThreshold } from "./oracle.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

// All oracle routes require authentication
router.get("/weather", authenticate, getWeather);
router.get("/crop", authenticate, getCropData);
router.get("/animal", authenticate, getAnimalData);
router.get("/target", authenticate, getTargetThreshold);

export default router;
