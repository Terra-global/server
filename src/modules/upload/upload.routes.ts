import { Router } from "express";
import multer from "multer";
import { uploadController } from "./upload.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

// Configure Multer for memory storage (since we're uploading to R2)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed") as any, false);
    }
  }
});

// Route for single file upload (protected by auth)
router.post(
  "/single", 
  authenticate, 
  upload.single("file"), 
  uploadController.uploadSingle
);

// Route for multiple files upload (protected by auth)
router.post(
  "/multiple",
  authenticate,
  upload.array("files", 10), // Limit to 10 files
  uploadController.uploadMultiple
);

export default router;
