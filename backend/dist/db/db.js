"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql2_1 = __importDefault(require("mysql2"));
const dotenv_1 = __importDefault(require("dotenv"));
const winston_js_1 = require("../config/winston.js");
dotenv_1.default.config();
const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "arush",
    password: process.env.DB_PASSWORD || "Arush@123",
    database: process.env.DB_NAME || "makemates",
    port: Number(process.env.DB_PORT) || 3306,
};
const db = mysql2_1.default.createConnection(dbConfig);
db.connect((err) => {
    if (err) {
        winston_js_1.logger.error("Database connection error:", err);
        throw err;
    }
    winston_js_1.logger.info("DB Connected");
});
exports.default = db;
