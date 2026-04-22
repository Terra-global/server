import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(`❌ [${req.method}] ${req.path} →`, err.message);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Prisma known errors
  if ((err as any).code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "A record with that value already exists.",
    });
  }

  // Unknown error
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  });
};
