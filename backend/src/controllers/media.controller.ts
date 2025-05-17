import { Response } from "express";
import { RequestWithUser } from "../typing";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import { exec } from "child_process";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../config/winston";
import { minioConfig } from "../config/minio.config";
import { Client } from "minio";
// Constants
const BUCKET_NAME = process.env.MINIO_BUCKET || "makemates";
const UPLOAD_DIR = "/tmp/uploads";

// Create upload directory if it doesn't exist
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Extend Express.Multer types
declare global {
  namespace Express {
    namespace Multer {
      interface File {
        buffer: Buffer;
        originalname: string;
        mimetype: string;
        size: number;
      }
    }
  }
}

const execPromise = util.promisify(exec);

const minioClient = new Client({
  endPoint: minioConfig.endpoint,
  useSSL: minioConfig.useSSL,
  accessKey: minioConfig.accessKey,
  secretKey: minioConfig.secretKey,
  pathStyle: minioConfig.forcePathStyle,
});

const ensureBucketExists = async () => {
  const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
  if (!bucketExists) {
    await minioClient.makeBucket(BUCKET_NAME, "us-east-1");
    console.log(`Created bucket: ${BUCKET_NAME}`);
  }
};

// Initialize the bucket on startup
ensureBucketExists().catch(console.error);

interface UploadedFile {
  originalName: string;
  url: string;
  type: "image" | "video";
  size: number;
}

interface UploadedFileResponse {
  originalName: string;
  url: string;
  type: "image" | "video";
  size: number;
}

// Process a single file upload
const processFileUpload = async (
  file: Express.Multer.File
): Promise<UploadedFile> => {
  const fileExt = path.extname(file.originalname).toLowerCase().substring(1);
  const isVideo = ["mp4", "mov", "avi", "mkv", "webm"].includes(fileExt);
  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(fileExt);

  if (!isVideo && !isImage) {
    throw new Error(`Unsupported file type: ${fileExt}`);
  }

  // Generate unique file names
  const fileId = uuidv4();
  const tempFilePath = path.join(UPLOAD_DIR, `${fileId}-${file.originalname}`);
  const outputFileName = `${fileId}.${isVideo ? "mp4" : "jpg"}`;
  const outputPath = path.join(UPLOAD_DIR, outputFileName);

  try {
    // Ensure the upload directory exists
    if (!fs.existsSync(path.dirname(tempFilePath))) {
      fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
    }

    // Write the uploaded file to a temporary location
    await fs.promises.writeFile(tempFilePath, file.buffer);

    let processedBuffer: Buffer;

    if (isImage) {
      // Process image using sharp
      const image = sharp(file.buffer);
      processedBuffer = await image
        .jpeg({ quality: 80, mozjpeg: true })
        .resize(1200, 1200, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .toBuffer();
    } else {
      // Process video using ffmpeg
      await new Promise<void>((resolve, reject) => {
        const ffmpegCmd = `ffmpeg -i ${tempFilePath} -vcodec libx264 -crf 28 -preset faster -pix_fmt yuv420p -movflags +faststart ${outputPath}`;
        exec(ffmpegCmd, (error) => {
          if (error) {
            reject(new Error(`FFmpeg error: ${error.message}`));
            return;
          }
          resolve();
        });
      });
      processedBuffer = await fs.promises.readFile(outputPath);
    }

    // Upload to MinIO
    await minioClient.putObject(
      BUCKET_NAME,
      outputFileName,
      processedBuffer,
      processedBuffer.length,
      {
        "Content-Type": isVideo ? "video/mp4" : "image/jpeg",
      }
    );

    // Generate public URL (adjust based on your MinIO configuration)
    const publicUrl = `${`http://${minioConfig.endpoint}`}/${BUCKET_NAME}/${outputFileName}`;

    return {
      originalName: file.originalname,
      url: publicUrl,
      type: isVideo ? "video" : "image",
      size: processedBuffer.length,
    };
  } catch (error) {
    console.error("Error processing file:", error);
    throw new Error(
      `Failed to process file: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  } finally {
    // Clean up temporary files
    try {
      if (fs.existsSync(tempFilePath)) await fs.promises.unlink(tempFilePath);
      if (fs.existsSync(outputPath)) await fs.promises.unlink(outputPath);
    } catch (cleanupError) {
      console.error("Error cleaning up temporary files:", cleanupError);
    }
  }
};

export const uploadMedia = async (req: RequestWithUser, res: Response) => {
  console.log("reaching here... In upload Media");
  console.log()

  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No files uploaded",
      });
    }

    // Process all files in parallel
    const results = await Promise.all(
      req.files.map((file) =>
        processFileUpload(file).catch((error) => ({
          originalName: file.originalname,
          error: error.message,
          success: false,
        }))
      )
    );

    // Check for any failed uploads
    const failedUploads = results.filter((result) => "error" in result);
    const successfulUploads = results.filter(
      (result): result is UploadedFile => "url" in result
    );

    if (failedUploads.length > 0) {
      console.error("Some files failed to upload:", failedUploads);
    }

    if (successfulUploads.length === 0) {
      return res.status(400).json({
        success: false,
        error: "All files failed to upload",
        details: failedUploads,
      });
    }

    return res.status(200).json({
      success: true,
      files: successfulUploads,
      ...(failedUploads.length > 0 && {
        _warnings: {
          failedCount: failedUploads.length,
          failedFiles: failedUploads.map((f) => ({
            name: f.originalName,
            error: f.error,
          })),
        },
      }),
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error("Error in uploadMedia:", errorMessage);
    res.status(500).json({
      success: false,
      error: "Failed to process media upload",
      details: errorMessage,
    });
  }
};
