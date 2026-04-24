import { Request, Response } from "express";
import { postService } from "./post.service";

export class PostController {
  async create(req: Request, res: Response) {
    try {
      const { 
        content, 
        imageUrls, 
        tags,
        postType,
        price,
        priceUnit,
        quantity,
        quantityUnit,
        location
      } = req.body;
      const userId = (req as any).user.userId;

      if (!content && (!imageUrls || imageUrls.length === 0)) {
        return res.status(400).json({ success: false, message: "Post must have content or at least one image" });
      }

      const post = await postService.createPost({ 
        content, 
        imageUrls, 
        tags, 
        userId,
        postType,
        price: price ? Number(price) : undefined,
        priceUnit,
        quantity: quantity ? Number(quantity) : undefined,
        quantityUnit,
        location
      });

      return res.status(201).json({ success: true, data: post });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getFeed(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = (req as any).user?.userId;

      const posts = await postService.getFeed(page, limit, userId);

      return res.status(200).json({ success: true, data: posts });
    } catch (error: any) {
      console.error("Error fetching feed:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user?.userId;
      const post = await postService.getPostById(id, userId);

      if (!post) {
        return res.status(404).json({ success: false, message: "Post not found" });
      }

      return res.status(200).json({ success: true, data: post });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async toggleLike(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user.userId;

      const result = await postService.toggleLike(id, userId);
      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async addComment(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { content } = req.body;
      const userId = (req as any).user.userId;

      if (!content) {
        return res.status(400).json({ success: false, message: "Comment content is required" });
      }

      const comment = await postService.addComment(id, userId, content);
      return res.status(201).json({ success: true, data: comment });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getComments(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const comments = await postService.getComments(id);
      return res.status(200).json({ success: true, data: comments });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  async getUserPosts(req: Request, res: Response) {
    try {
      const userId = req.params.userId as string;
      const currentUserId = (req as any).user?.userId;
      const posts = await postService.getUserPosts(userId, currentUserId);
      return res.status(200).json({ success: true, data: posts });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user.userId;

      await postService.deletePost(id, userId);
      return res.status(200).json({ success: true, message: "Post deleted successfully" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getLikedPosts(req: Request, res: Response) {
    try {
      const userId = req.params.userId as string;
      const posts = await postService.getLikedPosts(userId);
      return res.status(200).json({ success: true, data: posts });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const postController = new PostController();
