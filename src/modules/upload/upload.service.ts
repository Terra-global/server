import { s3Client } from "../../config/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { config } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const uploadService = {
  /**
   * Upload a single file to Cloudflare R2
   */
  async uploadFile(file: Express.Multer.File, folder: string = "general") {
    if (!file) {
      throw ApiError.badRequest("No file provided");
    }

    const fileExtension = path.extname(file.originalname);
    const fileName = `${folder}/${uuidv4()}${fileExtension}`;

    try {
      const command = new PutObjectCommand({
        Bucket: config.r2.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        // Optional: ACL is not supported by R2 in the same way, 
        // usually managed by bucket-level permissions or public access.
      });

      await s3Client.send(command);

      // Return the public URL
      // If a custom public URL is provided in env, use it. 
      // Otherwise, construct one from the endpoint (might need adjustments based on R2 public access setup)
      const baseUrl = config.r2.publicUrl || `${config.r2.endpoint}/${config.r2.bucketName}`;
      return {
        url: `${baseUrl}/${fileName}`,
        key: fileName,
        mimetype: file.mimetype,
        size: file.size
      };
    } catch (error: any) {
      console.error("R2 Upload Error:", error);
      throw ApiError.internal(`Upload failed: ${error.message}`);
    }
  },

  /**
   * Upload multiple files to Cloudflare R2
   */
  async uploadMultiple(files: Express.Multer.File[], folder: string = "general") {
    if (!files || files.length === 0) {
      throw ApiError.badRequest("No files provided");
    }

    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }
};
