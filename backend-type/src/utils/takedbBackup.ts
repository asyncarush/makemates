import { exec } from "child_process";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
import { promisify } from "util";

// Load environment variables from the root .env file
dotenv.config({ path: path.join(__dirname, "../../.env") });

const execPromise = promisify(exec);

// Check if DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL is not defined in .env file");
  process.exit(1);
}
const databaseUrl = new URL(process.env.DATABASE_URL!);

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
const takePGBackup = async (): Promise<void> => {
  try {
    // Set PGPASSWORD environment variable
    process.env.PGPASSWORD = password;

    const command = `pg_dump -U ${username} -h ${dbHost} -p ${dbPort} -d ${database} -F t -f "${backupFile}"`;

    console.log("Starting database backup...");
    const { stdout, stderr } = await execPromise(command);
    if (stderr) {
      console.error("Backup warning:", stderr);
    }
    console.log(`Backup created successfully at: ${backupFile}`);
    if (stdout) {
      console.log("Backup output:", stdout);
    }
  } catch (error) {
    console.error("Error creating backup:", error);
    process.exit(1);
  } finally {
    // Clear password from environment
    delete process.env.PGPASSWORD;
  }
};

// Execute backup
takePGBackup();
