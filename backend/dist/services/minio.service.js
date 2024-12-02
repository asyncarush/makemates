"use strict";
/**
 * @fileoverview Service for handling file operations with MinIO object storage.
 * Provides utilities for uploading, downloading, and managing files.
 */
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
exports.uploadFile = exports.MinioServiceError = void 0;
// MinIO client and types
const minio_1 = require("minio");
// Configuration
const minio_config_1 = require("../config/minio.config");
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
/**
 * MinIO client instance configuration
 */
const minioClient = new minio_1.Client({
    endPoint: minio_config_1.minioConfig.endpoint.replace(/^https?:\/\//, ""), // Remove protocol if present
    port: minio_config_1.minioConfig.port,
    useSSL: minio_config_1.minioConfig.useSSL,
    accessKey: minio_config_1.minioConfig.accessKey,
    secretKey: minio_config_1.minioConfig.secretKey,
});
const BUCKET_NAME = "posts";
/**
 * Initialize bucket and set public read policy
 */
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bucketExists = yield minioClient.bucketExists(BUCKET_NAME);
        if (!bucketExists) {
            yield minioClient.makeBucket(BUCKET_NAME, "us-east-1");
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
            yield minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
        }
    }
    catch (error) {
        console.error("Failed to initialize MinIO bucket:", error);
        throw new MinioServiceError("Failed to initialize MinIO bucket", error);
    }
}))();
/**
 * Upload file to MinIO storage
 *
 * @param {Express.Multer.File} file - The file to upload from multer
 * @param {string} fileName - The name to save the file as
 * @returns {Promise<string>} Public URL for the uploaded file
 * @throws {MinioServiceError} When upload fails
 */
const uploadFile = (file, fileName) => __awaiter(void 0, void 0, void 0, function* () {
    if (!file || !file.buffer) {
        throw new MinioServiceError("Invalid file provided");
    }
    // Validate file type
    const allowedMimeTypes = ["image/jpeg", "image/png"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new MinioServiceError(`Invalid file type. Allowed types: ${allowedMimeTypes.join(", ")}`);
    }
    try {
        // Upload file to MinIO with metadata
        const metadata = {
            "content-type": file.mimetype,
            "x-amz-meta-original-name": file.originalname,
        };
        yield minioClient.putObject(BUCKET_NAME, fileName, file.buffer, file.size, metadata);
        // Construct the public URL
        const protocol = minio_config_1.minioConfig.useSSL ? "https" : "http";
        const url = `${protocol}://${minio_config_1.minioConfig.endpoint}:${minio_config_1.minioConfig.port}/${BUCKET_NAME}/${fileName}`;
        return url;
    }
    catch (error) {
        console.error("MinIO upload error:", error);
        throw new MinioServiceError(`Failed to upload file: ${error.message || "Unknown error"}`, error);
    }
});
exports.uploadFile = uploadFile;
