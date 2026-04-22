import prisma from "../../config/database";

export const searchService = {
  /**
   * Search for users by display name.
   */
  async searchUsers(query: string) {
    return prisma.user.findMany({
      where: {
        username: { contains: query, mode: "insensitive" },
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        bio: true,
      },
      take: 20,
    });
  },
};
