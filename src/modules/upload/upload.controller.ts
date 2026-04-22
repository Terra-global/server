import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { uploadService } from "./upload.service";

export const uploadController = {
  /**
   * Handle single file upload
   */
  uploadSingle: asyncHandler(async (req: Request, res: Response) => {
    const file = req.file as Express.Multer.File;
    const folder = req.body.folder || "general";

    const result = await uploadService.uploadFile(file, folder);

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: result
    });
  })
};
