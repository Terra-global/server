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
  async searchPosts(query: string) {
    return prisma.post.findMany({
      where: {
        content: { contains: query, mode: "insensitive" },
      },
      include: {
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
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  },

  async globalSearch(query: string) {
    const [users, posts] = await Promise.all([
      this.searchUsers(query),
      this.searchPosts(query),
    ]);
    return { users, posts };
  },
};
