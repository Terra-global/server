import prisma from "../../config/database";
import { ApiError } from "../../utils/ApiError";

export const squareService = {
  async createSquare(userId: string, data: { title: string; description?: string }) {
    // Check if user is already in any active square
    const existingParticipation = await (prisma as any).squareParticipant.findFirst({
      where: { 
        userId,
        square: { isActive: true }
      },
    });

    if (existingParticipation) {
      throw ApiError.badRequest("You are already in a Townhall. Leave it to start a new one.");
    }

    return (prisma as any).marketSquare.create({
      data: {
        title: data.title,
        description: data.description,
        creatorId: userId,
        participants: {
          create: {
            userId,
            isOnStage: true,
          }
        }
      },
      include: {
        creator: {
          select: { id: true, username: true, avatarUrl: true }
        }
      }
    });
  },

  async getActiveSquares() {
    return (prisma as any).marketSquare.findMany({
      where: { isActive: true },
      include: {
        creator: {
          select: { id: true, username: true, avatarUrl: true }
        },
        _count: {
          select: { participants: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  },

  async getSquareById(squareId: string) {
    return (prisma as any).marketSquare.findUnique({
      where: { id: squareId },
      include: {
        creator: {
          select: { id: true, username: true, avatarUrl: true }
        },
        participants: {
          include: {
            user: {
              select: { id: true, username: true, avatarUrl: true, farmType: { select: { name: true } } }
            }
          }
        },
        messages: {
          take: 50,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: { id: true, username: true, avatarUrl: true }
            }
          }
        }
      }
    });
  },

  async joinSquare(squareId: string, userId: string) {
    const square = await (prisma as any).marketSquare.findUnique({
      where: { id: squareId }
    });

    if (!square || !square.isActive) {
      throw ApiError.notFound("Square is no longer active");
    }

    return (prisma as any).squareParticipant.upsert({
      where: {
        squareId_userId: { squareId, userId }
      },
      update: {},
      create: {
        squareId,
        userId,
        isOnStage: square.creatorId === userId
      },
      include: {
        user: {
          select: { id: true, username: true, avatarUrl: true }
        }
      }
    });
  },

  async leaveSquare(squareId: string, userId: string) {
    return (prisma as any).squareParticipant.delete({
      where: {
        squareId_userId: { squareId, userId }
      }
    }).catch(() => null); // Ignore if already left
  },

  async toggleStage(squareId: string, creatorId: string, targetUserId: string, status: boolean) {
    const square = await (prisma as any).marketSquare.findUnique({
      where: { id: squareId }
    });

    if (!square || square.creatorId !== creatorId) {
      throw ApiError.unauthorized("Only the creator can manage the stage");
    }

    return (prisma as any).squareParticipant.update({
      where: {
        squareId_userId: { squareId, userId: targetUserId }
      },
      data: { isOnStage: status }
    });
  },

  async raiseHand(squareId: string, userId: string, status: boolean) {
    return (prisma as any).squareParticipant.update({
      where: {
        squareId_userId: { squareId, userId }
      },
      data: { isHandRaised: status }
    });
  },

  async sendMessage(squareId: string, userId: string, content: string) {
    return (prisma as any).squareMessage.create({
      data: {
        squareId,
        userId,
        content
      },
      include: {
        user: {
          select: { id: true, username: true, avatarUrl: true }
        }
      }
    });
  },

  async endSquare(squareId: string, userId: string) {
    const square = await (prisma as any).marketSquare.findUnique({
      where: { id: squareId }
    });

    if (!square || square.creatorId !== userId) {
      throw ApiError.unauthorized("Only the creator can end the square");
    }

    // Perform a hard delete of the square and all its relations
    return (prisma as any).marketSquare.delete({
      where: { id: squareId }
    });
  },
  async getUserActiveSquare(userId: string) {
    return (prisma as any).squareParticipant.findFirst({
      where: { 
        userId,
        square: { isActive: true }
      },
      include: {
        square: true
      }
    });
  }
};
