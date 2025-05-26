"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMedia = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const util = __importStar(require("util"));
const child_process_1 = require("child_process");
const sharp_1 = __importDefault(require("sharp"));
const uuid_1 = require("uuid");
const winston_1 = require("../config/winston");
const minio_config_1 = require("../config/minio.config");
const minio_1 = require("minio");
// Constants
const BUCKET_NAME = process.env.MINIO_BUCKET || "makemates";
const UPLOAD_DIR = "/tmp/uploads";
// Create upload directory if it doesn't exist
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
const execPromise = util.promisify(child_process_1.exec);
const minioClient = new minio_1.Client({
    endPoint: minio_config_1.minioConfig.endpoint,
    useSSL: minio_config_1.minioConfig.useSSL,
    accessKey: minio_config_1.minioConfig.accessKey,
    secretKey: minio_config_1.minioConfig.secretKey,
    pathStyle: minio_config_1.minioConfig.forcePathStyle,
});
const ensureBucketExists = () => __awaiter(void 0, void 0, void 0, function* () {
    const bucketExists = yield minioClient.bucketExists(BUCKET_NAME);
    if (!bucketExists) {
        yield minioClient.makeBucket(BUCKET_NAME, "us-east-1");
        console.log(`Created bucket: ${BUCKET_NAME}`);
    }
});
// Initialize the bucket on startup
ensureBucketExists().catch(console.error);
// Process a single file upload
const processFileUpload = (file) => __awaiter(void 0, void 0, void 0, function* () {
    const fileExt = path.extname(file.originalname).toLowerCase().substring(1);
    const isVideo = ["mp4", "mov", "avi", "mkv", "webm"].includes(fileExt);
    const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(fileExt);
    if (!isVideo && !isImage) {
        throw new Error(`Unsupported file type: ${fileExt}`);
    }
    // Generate unique file names
    const fileId = (0, uuid_1.v4)();
    const tempFilePath = path.join(UPLOAD_DIR, `${fileId}-${file.originalname}`);
    const outputFileName = `${fileId}.${isVideo ? "mp4" : "jpg"}`;
    const outputPath = path.join(UPLOAD_DIR, outputFileName);
    try {
        // Ensure the upload directory exists
        if (!fs.existsSync(path.dirname(tempFilePath))) {
            fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
        }
        // Write the uploaded file to a temporary location
        yield fs.promises.writeFile(tempFilePath, file.buffer);
        let processedBuffer;
        if (isImage) {
            // Process image using sharp
            const image = (0, sharp_1.default)(file.buffer);
            processedBuffer = yield image
                .jpeg({ quality: 80, mozjpeg: true })
                .resize(1200, 1200, {
                fit: "inside",
                withoutEnlargement: true,
            })
                .toBuffer();
        }
        else {
            // Process video using ffmpeg
            yield new Promise((resolve, reject) => {
                const ffmpegCmd = `ffmpeg -i ${tempFilePath} -vcodec libx264 -crf 28 -preset faster -pix_fmt yuv420p -movflags +faststart ${outputPath}`;
                (0, child_process_1.exec)(ffmpegCmd, (error) => {
                    if (error) {
                        reject(new Error(`FFmpeg error: ${error.message}`));
                        return;
                    }
                    resolve();
                });
            });
            processedBuffer = yield fs.promises.readFile(outputPath);
        }
        // Upload to MinIO
        yield minioClient.putObject(BUCKET_NAME, outputFileName, processedBuffer, processedBuffer.length, {
            "Content-Type": isVideo ? "video/mp4" : "image/jpeg",
        });
        // Generate public URL (adjust based on your MinIO configuration)
        const publicUrl = `${`http://${minio_config_1.minioConfig.endpoint}`}/${BUCKET_NAME}/${outputFileName}`;
        return {
            originalName: file.originalname,
            url: publicUrl,
            type: isVideo ? "video" : "image",
            size: processedBuffer.length,
        };
    }
    catch (error) {
        console.error("Error processing file:", error);
        throw new Error(`Failed to process file: ${error instanceof Error ? error.message : String(error)}`);
    }
    finally {
        // Clean up temporary files
        try {
            if (fs.existsSync(tempFilePath))
                yield fs.promises.unlink(tempFilePath);
            if (fs.existsSync(outputPath))
                yield fs.promises.unlink(outputPath);
        }
        catch (cleanupError) {
            console.error("Error cleaning up temporary files:", cleanupError);
        }
    }
});
const uploadMedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("reaching here... In upload Media");
    console.log();
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: "No files uploaded",
            });
        }
        // Process all files in parallel
        const results = yield Promise.all(req.files.map((file) => processFileUpload(file).catch((error) => ({
            originalName: file.originalname,
            error: error.message,
            success: false,
        }))));
        // Check for any failed uploads
        const failedUploads = results.filter((result) => "error" in result);
        const successfulUploads = results.filter((result) => "url" in result);
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
        return res.status(200).json(Object.assign({ success: true, files: successfulUploads }, (failedUploads.length > 0 && {
            _warnings: {
                failedCount: failedUploads.length,
                failedFiles: failedUploads.map((f) => ({
                    name: f.originalName,
                    error: f.error,
                })),
            },
        })));
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        winston_1.logger.error("Error in uploadMedia:", errorMessage);
        res.status(500).json({
            success: false,
            error: "Failed to process media upload",
            details: errorMessage,
        });
    }
});
exports.uploadMedia = uploadMedia;
