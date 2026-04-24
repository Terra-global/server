import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../config/database";
import { config } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { RegisterInput, LoginInput } from "./auth.schema";
import { AuthPayload } from "../../middleware/auth";
import { OAuth2Client } from "google-auth-library";
import { notificationService, NotificationType } from "../notification/notification.service";
import { nanoid } from "nanoid";

const client = new OAuth2Client(config.googleClientId);

const SALT_ROUNDS = 12;

function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions);
}

export const authService = {
  /**
   * Register a new user.
   * If their email is in the admin whitelist, they automatically become an admin.
   */
  async register(data: RegisterInput) {
    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw ApiError.conflict("Email is already registered");
    }

    // Check if this email is whitelisted as admin
    const isWhitelisted = await prisma.adminWhitelist.findUnique({
      where: { email: data.email },
    });

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Handle referral
    let referredByUserId: string | undefined;
    if (data.referralCode) {
      const referrer = await (prisma.user as any).findFirst({
        where: { referralCode: data.referralCode },
      });
      if (referrer) {
        referredByUserId = referrer.id;
      }
    }

    // Generate unique referral code for new user
    const userReferralCode = nanoid(8).toUpperCase();

    // Create user
    const user = await (prisma.user as any).create({
      data: {
        email: data.email,
        passwordHash,
        country: data.country,
        isAdmin: !!isWhitelisted,
        referralCode: userReferralCode,
        referredById: referredByUserId,
      },
      select: {
        id: true,
        email: true,
        country: true,
        isAdmin: true,
        referralCode: true,
        createdAt: true,
      },
    });

    // Notify referrer
    if (referredByUserId) {
      await notificationService.createNotification({
        type: NotificationType.REFERRAL,
        userId: referredByUserId,
        actorId: user.id,
      });
    }

    // Generate JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    return { user, token };
  },

  /**
   * Login with email and password.
   */
  async login(data: LoginInput) {
    const user = await (prisma.user as any).findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash as string);

    if (!isValidPassword) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        country: user.country,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        referralCode: user.referralCode,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
      token,
    };
  },

  /**
   * Get current user profile from token.
   */
  async getMe(userId: string) {
    let user = await (prisma.user as any).findUnique({
      where: { id: userId },
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
        referralCode: true,
        isAdmin: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    if (!user.referralCode) {
      user = await (prisma.user as any).update({
        where: { id: userId },
        data: { referralCode: nanoid(8).toUpperCase() },
        select: {
          id: true,
          email: true,
          username: true,
          country: true,
          bio: true,
          avatarUrl: true,
          website: true,
          farmType: { select: { id: true, name: true } },
          socialLinks: { select: { platform: true, url: true } },
          referralCode: true,
          isAdmin: true,
          createdAt: true,
        },
      });
    }

    return user;
  },

  /**
   * Google Social Login/Signup
   */
  async googleLogin(idToken: string) {
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: config.googleClientId,
      });
      const payload = ticket.getPayload();
      if (!payload) throw ApiError.unauthorized("Invalid Google token");

      const { email, sub: googleId, name, picture } = payload;
      if (!email) throw ApiError.unauthorized("Email not found in Google account");

      // Find or create user
      let user = await (prisma.user as any).findUnique({
        where: { email },
      });

      if (!user) {
        user = await (prisma.user as any).create({
          data: {
            email,
            googleId,
            username: name?.replace(/\s+/g, '').toLowerCase() || email.split('@')[0],
            avatarUrl: picture,
            referralCode: nanoid(8).toUpperCase(),
          },
        });
      } else if (!user.googleId) {
        // Link google account if not already linked
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId },
        });
      }

      const token = generateToken({
        userId: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          avatarUrl: user.avatarUrl,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
        },
        token,
      };
    } catch (error) {
      console.error("Google Login Error:", error);
      throw ApiError.unauthorized("Google authentication failed");
    }
  },
};
