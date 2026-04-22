import prisma from "../../config/database";

export class PostService {
  async createPost(data: { content: string; imageUrl?: string; userId: string }) {
    return prisma.post.create({
      data: {
        content: data.content,
        imageUrl: data.imageUrl,
        userId: data.userId,
      },
      include: {
        user: {
          select: {
            username: true,
            avatarUrl: true,
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

  async getPostById(id: string, userId?: string) {
    const include: any = {
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
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
      return { liked: true };
    }
  }

  async addComment(postId: string, userId: string, content: string) {
    return prisma.comment.create({
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
}

export const postService = new PostService();
