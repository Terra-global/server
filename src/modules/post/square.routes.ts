import { Router } from "express";
import { squareController } from "./square.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.post("/", authenticate, squareController.create);
router.get("/active", authenticate, squareController.getActive);
router.get("/my-active", authenticate, squareController.getMyActive);
router.get("/:id", authenticate, squareController.getOne);
router.post("/:id/join", authenticate, squareController.join);
router.post("/:id/leave", authenticate, squareController.leave);
router.post("/:id/stage", authenticate, squareController.toggleStage);
router.post("/:id/raise-hand", authenticate, squareController.raiseHand);
router.post("/:id/messages", authenticate, squareController.sendMessage);
router.post("/:id/end", authenticate, squareController.end);

export default router;
