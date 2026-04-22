import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { adminService } from "./admin.service";
import { ApiError } from "../../utils/ApiError";

export const adminController = {
  // ─── WHITELIST ────────────────────────────────────────────

  addToWhitelist: asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) throw ApiError.badRequest("Email is required");

    const entry = await adminService.addToWhitelist(email);

    res.status(201).json({
      success: true,
      message: "Email added to admin whitelist",
      data: entry,
    });
  }),

  removeFromWhitelist: asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.params;
    if (!email) throw ApiError.badRequest("Email is required");

    const result = await adminService.removeFromWhitelist(email as string);

    res.json({ success: true, ...result });
  }),

  getWhitelist: asyncHandler(async (_req: Request, res: Response) => {
    const list = await adminService.getWhitelist();

    res.json({ success: true, data: list });
  }),

  // ─── USERS ────────────────────────────────────────────────

  listAllUsers: asyncHandler(async (_req: Request, res: Response) => {
    const users = await adminService.listAllUsers();

    res.json({ success: true, data: users });
  }),
};
