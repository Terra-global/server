import prisma from "../../config/database";

export const homeService = {
  /**
   * Get the home feed for a user.
   * Returns their profile summary.
   */
  async getFeed(userId: string) {
    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatarUrl: true,
        isAdmin: true,
      },
    });

    return {
      user,
    };
  },
};
