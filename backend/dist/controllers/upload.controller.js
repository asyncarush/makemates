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
exports.uploadFileController = void 0;
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
        const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        // Your file upload logic here
        return Promise.resolve((0, minio_service_1.uploadFile)(file, fileName));
    })));
    console.log("All images url :", urls);
    res.json({
        success: true,
        message: "Files uploaded successfully",
        urls,
    });
});
exports.uploadFileController = uploadFileController;
