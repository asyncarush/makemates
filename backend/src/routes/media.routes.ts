import { Router, Request, Response, NextFunction } from "express";
import { uploadMedia } from "../controllers/media.controller";
import auth from "../middleware/auth";
import multer from "multer";
import { RequestWithUser } from "../typing";

// Extend the Request type to include the files property from multer
declare global {
  namespace Express {
    interface Request {
      files?:
        | { [fieldname: string]: Express.Multer.File[] }
        | Express.Multer.File[];
    }
  }
}

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10, // Max 10 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-matroska",
      "video/webm",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images and videos are allowed."));
    }
  },
});

// Upload media files
router.post("/upload", auth, upload.array("files"), uploadMedia);

export default router;
