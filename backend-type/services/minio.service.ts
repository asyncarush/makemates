import { Client } from "minio";
import { Request } from "express";
import * as multer from "multer";

import { minioConfig } from "../config/minio.config";
/**
 * Interface for file upload request
 */
export interface FileUploadRequest extends Request {
  file: Express.Multer.File;
}

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
  port: minioConfig.port,
  useSSL: minioConfig.useSSL,
  accessKey: minioConfig.accessKey,
  secretKey: minioConfig.secretKey,
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
 * @returns {Promise<string>} Presigned URL for the uploaded file
 * @throws {MinioServiceError} When upload or URL generation fails
 */
export const uploadFile = async (
  file: Express.Multer.File,
  fileName: string
): Promise<string> => {
  if (!file || !file.buffer) {
    throw new MinioServiceError("Invalid file provided");
  }

  try {
    // Upload file to MinIO with metadata
    const metadata = {
      "content-type": file.mimetype,
      "x-amz-meta-original-name": file.originalname,
    };

    await minioClient.putObject(
      BUCKET_NAME,
      fileName,
      file.buffer,
      file.size,
      metadata
    );

    // Generate presigned URL for the uploaded object
    const url = await minioClient.presignedGetObject(
      BUCKET_NAME,
      fileName,
      24 * 60 * 60 // 24 hours expiry
    );

    return url;
  } catch (error) {
    console.error("MinIO upload error:", error);
    throw new MinioServiceError("Failed to upload file to MinIO", error);
  }
};
