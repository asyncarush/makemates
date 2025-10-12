import { Client } from "minio";
import { minioConfig } from "../config/minio.config";
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

const BUCKET_NAME = "posts";

/**
 * MinIO client instance configuration
 */
const minioClient = new Client({
  endPoint: minioConfig.endpoint,   // e.g. "127.0.0.1" or "minio"
  port: minioConfig.port,           // 9000
  useSSL: minioConfig.useSSL,       // false (since you're using http://)
  accessKey: minioConfig.accessKey, // "minioadmin"
  secretKey: minioConfig.secretKey, // "minioadmin"
  region: "us-east-1",              // ✅ force region to match bucket
  pathStyle: true,                  // ✅ safer for local MinIO
});

logger.info("Initialized MinIO client", {
  endpoint: minioConfig.endpoint,
  port: minioConfig.port,
  useSSL: minioConfig.useSSL,
});

/**
 * Initialize bucket and set public read policy
 */
(async () => {
  try {
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
    if (!bucketExists) {
      await minioClient.makeBucket(BUCKET_NAME, "us-east-1");
      logger.info(`Bucket '${BUCKET_NAME}' created`);

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
      logger.info(`Public read policy applied to bucket '${BUCKET_NAME}'`);
    } else {
      logger.info(`Bucket '${BUCKET_NAME}' already exists`);
    }
  } catch (error) {
    logger.error("Failed to initialize MinIO bucket", { error });
    throw new MinioServiceError("Failed to initialize MinIO bucket", error);
  }
})();

/**
 * Upload file to MinIO
 */
export const uploadFile = async (
  file: Express.Multer.File,
  fileName: string
): Promise<string> => {
  if (!file?.buffer) {
    throw new MinioServiceError("Invalid file provided");
  }

  const allowedMimeTypes = [
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "video/mp4", "video/quicktime", "video/x-msvideo",
    "video/x-matroska", "video/webm",
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new MinioServiceError("Invalid file type uploaded");
  }

  try {
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

    const protocol = minioConfig.useSSL ? "https" : "http";
    const url = `${protocol}://${minioConfig.endpoint}:${minioConfig.port}/${BUCKET_NAME}/${fileName}`;
    return url;
  } catch (error: any) {
    throw new MinioServiceError(
      `Failed to upload file: ${error.message || "Unknown error"}`,
      error
    );
  }
};

/**
 * Delete file from MinIO
 */
export const deleteFile = async (fileName: string): Promise<void> => {
  try {
    await minioClient.removeObject(BUCKET_NAME, fileName);
  } catch (error: any) {
    throw new MinioServiceError(
      `Failed to delete file: ${error.message || "Unknown error"}`,
      error
    );
  }
};
