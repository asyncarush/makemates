"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.minioConfig = void 0;
require("dotenv/config");
exports.minioConfig = {
    endpoint: process.env.MINIO_ENDPOINT || "localhost",
    port: parseInt(process.env.MINIO_PORT || "9000"),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
    forcePathStyle: true
};
