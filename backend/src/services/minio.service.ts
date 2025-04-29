/**
 * @fileoverview Service for handling file operations with MinIO object storage.
 * Provides utilities for uploading, downloading, and managing files.
 */

// MinIO client and types
import { Client, BucketItemFromList } from "minio";

// Configuration
import { minioConfig } from "../config/minio.config";

// Logging
import { logger } from "../config/winston";

/**
 * Custom error class for MinIO service errors
 */
export class MinioServiceError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = "MinioServiceError";
  }
}

/**
 * MinIO client instance configuration
 */
const minioClient = new Client({
  endPoint: minioConfig.endpoint,
  useSSL: minioConfig.useSSL,
  accessKey: minioConfig.accessKey,
  secretKey: minioConfig.secretKey,
  pathStyle: minioConfig.forcePathStyle,
});

// Add debug logging
logger.info("Initializing MinIO client with config:", {
  endpoint: minioConfig.endpoint,
  useSSL: minioConfig.useSSL,
  pathStyle: minioConfig.forcePathStyle,
});

const BUCKET_NAME = "posts";

/**
 * Initialize bucket and set public read policy
 */
(async () => {
  try {
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
    if (!bucketExists) {
      await minioClient.makeBucket(BUCKET_NAME, "us-east-1");

      // Set bucket policy for public read access
      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
          },
        ],
      };

      await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
    }
  } catch (error) {
    console.error("Failed to initialize MinIO bucket:", error);
    throw new MinioServiceError("Failed to initialize MinIO bucket", error);
  }
})();

/**
 * Upload file to MinIO storage
 *
 * @param {Express.Multer.File} file - The file to upload from multer
 * @param {string} fileName - The name to save the file as
 * @returns {Promise<string>} Public URL for the uploaded file
 * @throws {MinioServiceError} When upload fails
 */

export const uploadFile = async (
  file: Express.Multer.File,
  fileName: string
): Promise<string> => {
  if (!file || !file.buffer) {
    throw new MinioServiceError("Invalid file provided");
  }

  // Validate file type
  const allowedMimeTypes = ["image/jpeg", "image/png"];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new MinioServiceError(
      `Invalid file type. Allowed types: ${allowedMimeTypes.join(", ")}`
    );
  }

  try {
    // Upload file to MinIO with metadata
    const metadata = {
      "content-type": file.mimetype,
      "x-amz-meta-original-name": file.originalname,
    };

    console.log("Reaching");
    await minioClient.putObject(
      BUCKET_NAME,
      fileName,
      file.buffer,
      file.size,
      metadata
    );
    // Construct the public URL
    const protocol = minioConfig.useSSL ? "https" : "http";
    const url = `${protocol}://${minioConfig.endpoint}/${BUCKET_NAME}/${fileName}`;
    return url;
  } catch (error: any) {
    console.error("MinIO upload error:", error);
    throw new MinioServiceError(
      `Failed to upload file: ${error.message || "Unknown error"}`,
      error
    );
  }
};
