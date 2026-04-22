import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { homeService } from "./home.service";

export const homeController = {
  getFeed: asyncHandler(async (req: Request, res: Response) => {
    const feed = await homeService.getFeed(req.user!.userId);

    res.json({
      success: true,
      data: feed,
    });
  }),
};
