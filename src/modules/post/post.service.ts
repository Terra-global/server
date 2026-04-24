import prisma from "../../config/database";
import { notificationService, NotificationType } from "../notification/notification.service";
import { ApiError } from "../../utils/ApiError";

export class PostService {
  async createPost(data: { 
    content: string; 
    imageUrls?: string[]; 
    tags?: string[]; 
    userId: string;
    postType?: any;
    price?: number;
    priceUnit?: string;
    quantity?: number;
    quantityUnit?: string;
    location?: string;
  }) {
    return prisma.post.create({
      data: {
        content: data.content,
        imageUrls: data.imageUrls || [],
        tags: data.tags || [],
        userId: data.userId,
        postType: data.postType || 'REGULAR',
        price: data.price,
        priceUnit: data.priceUnit,
        quantity: data.quantity,
        quantityUnit: data.quantityUnit,
        location: data.location,
      },
      include: {
        user: {
          select: {
            username: true,
            avatarUrl: true,
            farmType: { select: { name: true } },
          },
        },
      },
    });
  }

  async getFeed(page = 1, limit = 10, userId?: string) {
    const skip = (page - 1) * limit;
    
    const include: any = {
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          farmType: { select: { name: true } },
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        }
      },
    };

    if (userId) {
      include.likes = {
        where: { userId },
        select: { id: true }
      };
    }

    return prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include,
    });
  }

  async incrementViews(id: string) {
    return (prisma.post as any).update({
      where: { id },
      data: {
        views: {
          increment: 1
        }
      }
    });
  }

  async getPostById(id: string, userId?: string) {
    // Increment views when a post is fetched individually
    await this.incrementViews(id).catch(err => console.error("Failed to increment views:", err));

    const include: any = {
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          farmType: { select: { name: true } },
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        }
      },
    };

    if (userId) {
      include.likes = {
        where: { userId },
        select: { id: true }
      };
    }

    return prisma.post.findUnique({
      where: { id },
      include,
    });
  }

  async toggleLike(postId: string, userId: string) {
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: { postId, userId }
      }
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
      return { liked: false };
    } else {
      await prisma.like.create({
        data: { postId, userId }
      });

      // Notify post owner
      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (post) {
        await notificationService.createNotification({
          type: NotificationType.LIKE,
          userId: post.userId,
          actorId: userId,
          postId: postId,
        });
      }

      return { liked: true };
    }
  }

  async addComment(postId: string, userId: string, content: string) {
    const comment = await prisma.comment.create({
      data: { postId, userId, content },
      include: {
        user: {
          select: {
            username: true,
            avatarUrl: true,
          }
        }
      }
    });

    // Notify post owner
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (post) {
      await notificationService.createNotification({
        type: NotificationType.COMMENT,
        userId: post.userId,
        actorId: userId,
        postId: postId,
      });
    }

    return comment;
  }

  async getComments(postId: string) {
    return prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            username: true,
            avatarUrl: true,
          }
        }
      }
    });
  }
  async getUserPosts(targetUserId: string, currentUserId?: string) {
    const include: any = {
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          farmType: { select: { name: true } },
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        }
      },
    };

    if (currentUserId) {
      include.likes = {
        where: { userId: currentUserId },
        select: { id: true }
      };
    }

    return prisma.post.findMany({
      where: { userId: targetUserId },
      orderBy: { createdAt: "desc" },
      include,
    });
  }

  async deletePost(id: string, userId: string) {
    const post = await prisma.post.findUnique({
      where: { id }
    });

    if (!post) throw new Error("Post not found");
    if (post.userId !== userId) throw new Error("Unauthorized to delete this post");

    return prisma.post.delete({
      where: { id }
    });
  }
  async getLikedPosts(userId: string) {
    const include: any = {
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          farmType: { select: { name: true } },
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        }
      },
      likes: {
        where: { userId },
        select: { id: true }
      }
    };

    const liked = await prisma.like.findMany({
      where: { userId },
      include: {
        post: {
          include
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return liked.map(l => l.post);
  }
}

export const postService = new PostService();
