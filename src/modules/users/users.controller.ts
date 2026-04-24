import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { usersService } from "./users.service";
import { updateProfileSchema } from "./users.schema";
import { ApiError } from "../../utils/ApiError";

export const usersController = {
  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.issues[0].message);
    }

    const userId = req.user!.userId;
    const user = await usersService.updateProfile(userId, parsed.data);

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  }),

  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const currentUserId = (req as any).user?.userId;
    const user = await usersService.getPublicProfile(id as string, currentUserId);

    res.json({
      success: true,
      data: user,
    });
  }),

  getFarmTypes: asyncHandler(async (_req: Request, res: Response) => {
    const farmTypes = await usersService.getFarmTypes();
    res.json({
      success: true,
      data: farmTypes,
    });
  }),

  toggleFollow: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const followerId = req.user!.userId;
    const result = await usersService.toggleFollow(followerId, id as string);

    res.json({
      success: true,
      data: result,
    });
  }),

  getFollowing: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const following = await usersService.getFollowing(userId);
    res.json({
      success: true,
      data: following,
    });
  }),

  getReferrals: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const referrals = await usersService.getReferrals(userId);
    res.json({
      success: true,
      data: referrals,
    });
  }),
};
