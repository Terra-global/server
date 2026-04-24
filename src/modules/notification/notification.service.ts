import db from "../../config/database";

const prisma = db as any;

export enum NotificationType {
  FOLLOW = "FOLLOW",
  LIKE = "LIKE",
  COMMENT = "COMMENT",
  MESSAGE = "MESSAGE",
  REFERRAL = "REFERRAL",
}

export class NotificationService {
  async createNotification(data: {
    type: NotificationType;
    userId: string;
    actorId: string;
    postId?: string;
  }) {
    // Don't notify if actor is the same as recipient
    if (data.userId === data.actorId) return;

    return prisma.notification.create({
      data: {
        type: data.type,
        userId: data.userId,
        actorId: data.actorId,
        postId: data.postId,
      },
    });
  }

  async getNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        actor: {
          select: {
            username: true,
            avatarUrl: true,
          },
        },
        post: {
          select: {
            content: true,
            imageUrls: true,
          },
        },
      },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}

export const notificationService = new NotificationService();
