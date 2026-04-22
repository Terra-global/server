import prisma from "../../config/database";
import { ApiError } from "../../utils/ApiError";

export const adminService = {
  // ─── WHITELIST MANAGEMENT ─────────────────────────────────

  /**
   * Add an email to the admin whitelist.
   */
  async addToWhitelist(email: string) {
    const existing = await prisma.adminWhitelist.findUnique({
      where: { email },
    });

    if (existing) {
      throw ApiError.conflict("Email is already whitelisted");
    }

    const entry = await prisma.adminWhitelist.create({
      data: { email },
    });

    // If user already exists with this email, promote them to admin
    await prisma.user.updateMany({
      where: { email },
      data: { isAdmin: true },
    });

    return entry;
  },

  /**
   * Remove an email from the admin whitelist.
   */
  async removeFromWhitelist(email: string) {
    const entry = await prisma.adminWhitelist.findUnique({
      where: { email },
    });

    if (!entry) {
      throw ApiError.notFound("Email not in whitelist");
    }

    await prisma.adminWhitelist.delete({
      where: { email },
    });

    // Demote the user if they exist
    await prisma.user.updateMany({
      where: { email },
      data: { isAdmin: false },
    });

    return { message: "Email removed from whitelist" };
  },

  /**
   * List all whitelisted admin emails.
   */
  async getWhitelist() {
    return prisma.adminWhitelist.findMany({
      orderBy: { addedAt: "desc" },
    });
  },

  /**
   * List all users (admin overview).
   */
  async listAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        isAdmin: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },
};
