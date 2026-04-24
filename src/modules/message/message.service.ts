import prisma from "../../config/database";
import { notificationService, NotificationType } from "../notification/notification.service";
import { ApiError } from "../../utils/ApiError";

export class MessageService {
  async getConversations(userId: string) {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
          where: {
            userId: { not: userId },
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return conversations.map((conv) => ({
      id: conv.id,
      otherUser: conv.participants[0]?.user,
      lastMessage: conv.messages[0],
      updatedAt: conv.updatedAt,
    }));
  }

  async getMessages(userId: string, otherUserId: string) {
    // Find conversation between the two users
    const conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: otherUserId } } },
        ],
      },
    });

    if (!conversation) {
      return [];
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
    });

    // Mark unread messages from other sender as read
    await prisma.message.updateMany({
      where: {
        conversationId: conversation.id,
        senderId: { not: userId },
        read: false,
      },
      data: { read: true },
    });

    return messages;
  }

  async sendMessage(senderId: string, receiverId: string, content: string) {
    if (senderId === receiverId) {
      throw new ApiError(400, "Cannot send message to yourself");
    }

    // Find existing conversation between the two users
    const existingConv = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: senderId } } },
          { participants: { some: { userId: receiverId } } },
        ],
      },
    });

    let conversationId;

    if (existingConv) {
      conversationId = existingConv.id;
      // Update conversation timestamp
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });
    } else {
      // Create new conversation
      const newConv = await prisma.conversation.create({
        data: {
          participants: {
            create: [
              { userId: senderId },
              { userId: receiverId },
            ],
          },
        },
      });
      conversationId = newConv.id;
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
      },
    });

    // Create notification
    await notificationService.createNotification({
      type: NotificationType.MESSAGE,
      userId: receiverId,
      actorId: senderId,
    });

    return message;
  }
}

export const messageService = new MessageService();
