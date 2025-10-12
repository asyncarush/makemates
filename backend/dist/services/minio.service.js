"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.uploadFile = exports.MinioServiceError = void 0;
const minio_1 = require("minio");
const minio_config_1 = require("../config/minio.config");
const winston_1 = require("../config/winston");
/**
 * Custom error class for MinIO service errors
 */
class MinioServiceError extends Error {
    constructor(message, originalError) {
        super(message);
        this.originalError = originalError;
        this.name = "MinioServiceError";
    }
}
exports.MinioServiceError = MinioServiceError;
const BUCKET_NAME = "posts";
/**
 * MinIO client instance configuration
 */
const minioClient = new minio_1.Client({
    endPoint: minio_config_1.minioConfig.endpoint, // e.g. "127.0.0.1" or "minio"
    port: minio_config_1.minioConfig.port, // 9000
    useSSL: minio_config_1.minioConfig.useSSL, // false (since you're using http://)
    accessKey: minio_config_1.minioConfig.accessKey, // "minioadmin"
    secretKey: minio_config_1.minioConfig.secretKey, // "minioadmin"
    region: "us-east-1", // ✅ force region to match bucket
    pathStyle: true, // ✅ safer for local MinIO
});
winston_1.logger.info("Initialized MinIO client", {
    endpoint: minio_config_1.minioConfig.endpoint,
    port: minio_config_1.minioConfig.port,
    useSSL: minio_config_1.minioConfig.useSSL,
});
/**
 * Initialize bucket and set public read policy
 */
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bucketExists = yield minioClient.bucketExists(BUCKET_NAME);
        if (!bucketExists) {
            yield minioClient.makeBucket(BUCKET_NAME, "us-east-1");
            winston_1.logger.info(`Bucket '${BUCKET_NAME}' created`);
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
            yield minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
            winston_1.logger.info(`Public read policy applied to bucket '${BUCKET_NAME}'`);
        }
        else {
            winston_1.logger.info(`Bucket '${BUCKET_NAME}' already exists`);
        }
    }
    catch (error) {
        winston_1.logger.error("Failed to initialize MinIO bucket", { error });
        throw new MinioServiceError("Failed to initialize MinIO bucket", error);
    }
}))();
/**
 * Upload file to MinIO
 */
const uploadFile = (file, fileName) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(file === null || file === void 0 ? void 0 : file.buffer)) {
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
        yield minioClient.putObject(BUCKET_NAME, fileName, file.buffer, file.size, metadata);
        const protocol = minio_config_1.minioConfig.useSSL ? "https" : "http";
        const url = `${protocol}://${minio_config_1.minioConfig.endpoint}:${minio_config_1.minioConfig.port}/${BUCKET_NAME}/${fileName}`;
        return url;
    }
    catch (error) {
        throw new MinioServiceError(`Failed to upload file: ${error.message || "Unknown error"}`, error);
    }
});
exports.uploadFile = uploadFile;
/**
 * Delete file from MinIO
 */
const deleteFile = (fileName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield minioClient.removeObject(BUCKET_NAME, fileName);
    }
    catch (error) {
        throw new MinioServiceError(`Failed to delete file: ${error.message || "Unknown error"}`, error);
    }
});
exports.deleteFile = deleteFile;
