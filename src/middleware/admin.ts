import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

/**
 * Middleware: Checks if the authenticated user is an admin.
 * Must be used AFTER the `authenticate` middleware.
 */
export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    throw ApiError.unauthorized("Authentication required");
  }

  if (!req.user.isAdmin) {
    throw ApiError.forbidden("Admin access required");
  }

  next();
};
