import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { notificationService } from "./notification.service";

export const notificationController = {
  getNotifications: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const notifications = await notificationService.getNotifications(userId);
    res.json({ success: true, data: notifications });
  }),

  markAsRead: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    await notificationService.markAsRead(id as string, userId);
    res.json({ success: true, message: "Notification marked as read" });
  }),

  markAllAsRead: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    await notificationService.markAllAsRead(userId);
    res.json({ success: true, message: "All notifications marked as read" });
  }),
};
