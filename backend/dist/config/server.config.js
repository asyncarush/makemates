"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerConfig = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const body_parser_1 = __importDefault(require("body-parser"));
const morgan_1 = __importDefault(require("morgan"));
class ServerConfig {
    constructor() {
        this.app = (0, express_1.default)();
        this.setupMiddleware();
    }
    setupMiddleware() {
        // CORS configuration
        const allowedOrigins = ["http://localhost:3000", "https://makemates.asyncarush.com"];
        this.app.use((0, cors_1.default)({
            origin: allowedOrigins,
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization"],
            exposedHeaders: ["Set-Cookie"],
        }));
        // Handle CORS preflight for all routes
        this.app.options("*", (0, cors_1.default)({
            origin: allowedOrigins,
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization"],
            exposedHeaders: ["Set-Cookie"],
        }), (req, res) => {
            res.sendStatus(200);
        });
        // Development logging
        if (process.env.NODE_ENV === "development") {
            this.app.use((0, morgan_1.default)("dev"));
        }
        // Security and performance middleware
        this.app.use((0, compression_1.default)());
        this.app.use((0, helmet_1.default)());
        this.app.use((0, cookie_parser_1.default)());
        this.app.use(body_parser_1.default.urlencoded({ extended: false }));
        this.app.use(body_parser_1.default.json());
        // Health check endpoint
        this.app.get("/health", (req, res) => {
            res.status(200).send("Chill , everything is working fine");
        });
    }
    getApp() {
        return this.app;
    }
}
exports.ServerConfig = ServerConfig;
