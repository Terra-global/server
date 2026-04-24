import { Router } from "express";
import { messageController } from "./message.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

// Apply auth middleware to all message routes
router.use(authenticate);

router.get("/conversations", messageController.getConversations);
router.get("/:otherUserId", messageController.getMessages);
router.post("/", messageController.sendMessage);

export default router;
