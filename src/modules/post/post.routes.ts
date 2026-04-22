import { Router } from "express";
import { postController } from "./post.controller";
import { authenticate, optionalAuthenticate } from "../../middleware/auth";

const router = Router();

router.post("/", authenticate, postController.create);
router.get("/feed", optionalAuthenticate, postController.getFeed);
router.get("/:id", optionalAuthenticate, postController.getOne);

// Likes
router.post("/:id/like", authenticate, postController.toggleLike);

// Comments
router.post("/:id/comments", authenticate, postController.addComment);
router.get("/:id/comments", postController.getComments);
router.get("/user/:userId", optionalAuthenticate, postController.getUserPosts);

export default router;
