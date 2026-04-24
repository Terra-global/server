import { Request, Response } from "express";
import { messageService } from "./message.service";

export class MessageController {
  async getConversations(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const conversations = await messageService.getConversations(userId);
      return res.status(200).json({ success: true, data: conversations });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getMessages(req: Request, res: Response) {
    try {
      const otherUserId = req.params.otherUserId as string;
      const userId = (req as any).user.userId;
      const messages = await messageService.getMessages(userId, otherUserId);
      return res.status(200).json({ success: true, data: messages });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  async sendMessage(req: Request, res: Response) {
    try {
      const senderId = (req as any).user.userId;
      const { receiverId, content } = req.body;

      if (!receiverId || !content) {
        return res.status(400).json({ success: false, message: "Receiver ID and content are required" });
      }

      const message = await messageService.sendMessage(senderId, receiverId, content);
      return res.status(201).json({ success: true, data: message });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }
}

export const messageController = new MessageController();
