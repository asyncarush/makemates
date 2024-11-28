import { Router } from "express";
import multer from "multer";
import { uploadFileController } from "../controllers/upload.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.array("post_images"), uploadFileController);

export default router;
