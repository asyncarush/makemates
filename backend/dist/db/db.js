"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql2_1 = __importDefault(require("mysql2"));
const dotenv_1 = __importDefault(require("dotenv"));
const winston_1 = require("../config/winston");
dotenv_1.default.config();
const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "makemates",
    port: Number(process.env.DB_PORT) || 5432,
};
console.log(dbConfig);
const db = mysql2_1.default.createConnection(dbConfig);
function checkConnection() {
    return new Promise((resolve, reject) => {
        db.connect((err) => {
            if (err) {
                winston_1.logger.error("Database connection error:", err);
                return reject(err);
            }
            winston_1.logger.info("DB Connected");
            return resolve(db);
        });
    });
}
exports.default = checkConnection;
