import prisma from "../../config/database";
import { ApiError } from "../../utils/ApiError";
import { UpdateProfileInput } from "./users.schema";

export const usersService = {
  /**
   * Update a user's profile information.
   */
  async updateProfile(userId: string, data: UpdateProfileInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        username: data.username !== undefined ? data.username : undefined,
        bio: data.bio !== undefined ? data.bio : undefined,
        avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : undefined,
        website: data.website !== undefined ? data.website : undefined,
        farmTypeId: data.farmTypeId !== undefined ? data.farmTypeId : undefined,
        socialLinks: data.socialLinks !== undefined ? {
          deleteMany: {},
          create: data.socialLinks.map(link => ({
            platform: link.platform,
            url: link.url
          }))
        } : undefined,
      },
      select: {
        id: true,
        email: true,
        username: true,
        country: true,
        bio: true,
        avatarUrl: true,
        website: true,
        farmType: {
          select: { id: true, name: true }
        },
        socialLinks: {
          select: { platform: true, url: true }
        },
        isAdmin: true,
        updatedAt: true,
      },
    });
  },

  /**
   * Get a user's public profile by ID.
   */
  async getPublicProfile(userId: string, currentUserId?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        bio: true,
        avatarUrl: true,
        website: true,
        farmType: {
          select: { name: true }
        },
        socialLinks: {
          select: { platform: true, url: true }
        },
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          }
        },
        createdAt: true,
      },
    });

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    let isFollowing = false;
    if (currentUserId && currentUserId !== userId) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: userId,
          }
        }
      });
      isFollowing = !!follow;
    }

    return { ...user, isFollowing };
  },

  /**
   * Toggle follow status between two users.
   */
  async toggleFollow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw ApiError.badRequest("You cannot follow yourself");
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId }
      }
    });

    if (existingFollow) {
      await prisma.follow.delete({
        where: { id: existingFollow.id }
      });
      return { following: false };
    } else {
      await prisma.follow.create({
        data: { followerId, followingId }
      });
      return { following: true };
    }
  },

  /**
   * Get all available farm types.
   */
  async getFarmTypes() {
    return prisma.farmType.findMany({
      orderBy: { name: "asc" },
    });
  },
};
