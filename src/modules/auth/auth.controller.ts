import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authService } from "./auth.service";
import { registerSchema, loginSchema } from "./auth.schema";
import { ApiError } from "../../utils/ApiError";

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.issues[0].message);
    }

    const result = await authService.register(parsed.data);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: result,
    });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.issues[0].message);
    }

    const result = await authService.login(parsed.data);

    res.json({
      success: true,
      message: "Login successful",
      data: result,
    });
  }),

  getMe: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getMe(req.user!.userId);

    res.json({
      success: true,
      data: user,
    });
  }),

  googleLogin: asyncHandler(async (req: Request, res: Response) => {
    const { idToken } = req.body;
    if (!idToken) {
      throw ApiError.badRequest("idToken is required");
    }

    const result = await authService.googleLogin(idToken);

    res.json({
      success: true,
      message: "Google login successful",
      data: result,
    });
  }),
};
