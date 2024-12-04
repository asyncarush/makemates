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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const child_process_1 = require("child_process");
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const util_1 = require("util");
// Load environment variables from the root .env file
dotenv.config({ path: path.join(__dirname, "../../.env") });
const execPromise = (0, util_1.promisify)(child_process_1.exec);
// Check if DATABASE_URL exists
if (!process.env.DATABASE_URL) {
    console.error("Error: DATABASE_URL is not defined in .env file");
    process.exit(1);
}
const databaseUrl = new URL(process.env.DATABASE_URL);
const username = databaseUrl.username;
const password = databaseUrl.password;
const database = databaseUrl.pathname.slice(1); // Remove leading '/'
const dbHost = databaseUrl.hostname;
const dbPort = databaseUrl.port || "5432";
// Backup directory setup
const backupDir = path.join(__dirname, "../backups");
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}
// Backup file name with timestamp
const date = new Date();
const timestamp = date.toISOString().replace(/[:.]/g, "-");
const backupFile = path.join(backupDir, `pg-backup-${timestamp}.tar`);
// PostgreSQL backup function
const takePGBackup = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Set PGPASSWORD environment variable
        process.env.PGPASSWORD = password;
        const command = `pg_dump -U ${username} -h ${dbHost} -p ${dbPort} -d ${database} -F t -f "${backupFile}"`;
        console.log("Starting database backup...");
        const { stdout, stderr } = yield execPromise(command);
        if (stderr) {
            console.error("Backup warning:", stderr);
        }
        console.log(`DB Backup created successfully at: ${backupFile}`);
        if (stdout) {
            console.log("Backup output:", stdout);
        }
    }
    catch (error) {
        console.error("Error creating backup:", error);
        process.exit(1);
    }
    finally {
        // Clear password from environment
        delete process.env.PGPASSWORD;
    }
});
// Execute backup
takePGBackup();
