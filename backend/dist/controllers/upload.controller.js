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
exports.uploadProfilePicture = exports.uploadFileController = void 0;
const minio_service_1 = require("../services/minio.service");
const uploadFileController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Ensure files exist and is an array
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({
            success: false,
            error: "No file uploaded",
        });
    }
    // Use Array.from to ensure it's an array
    const files = Array.isArray(req.files)
        ? req.files
        : req.files
            ? Object.values(req.files).flat()
            : [];
    // Use .map or .forEach as needed
    const urls = yield Promise.all(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8); // 6-char random string
        const sanitizedOriginal = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
        const fileName = `${timestamp}-${randomSuffix}-${sanitizedOriginal}`;
        return (0, minio_service_1.uploadFile)(file, fileName);
    })));
    res.json({
        success: true,
        message: "Files uploaded successfully",
        urls,
    });
});
exports.uploadFileController = uploadFileController;
const uploadProfilePicture = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "File not found!!",
        });
    }
    console.log("Profile Picture", req.file);
    const fileName = `profile-pc-${Date.now()}-${req.file.originalname}`;
    console.log("Filename : ", fileName);
    // this will save the file in MiniBucket
    const url = yield (0, minio_service_1.uploadFile)(req.file, fileName);
    res.status(200).json({
        success: true,
        message: "ProfilePic uploaded",
        url,
    });
});
exports.uploadProfilePicture = uploadProfilePicture;
