import { Router } from "express";
import multer from "multer";
import {
  uploadFileController,
  uploadProfilePicture,
} from "../controllers/upload.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.array("post_images"), uploadFileController);

router.post(
  "/upload/profileImage",
  upload.single("profile_image"),
  uploadProfilePicture
);

export default router;
