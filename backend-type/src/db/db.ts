import mysql, { Connection } from "mysql2";
import dotenv from "dotenv";
import { logger } from "../config/winston.js";

dotenv.config();

const dbConfig: any = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "arush",
  password: process.env.DB_PASSWORD || "Arush@123",
  database: process.env.DB_NAME || "makemates",
  port: Number(process.env.DB_PORT) || 3306,
};

const db: Connection = mysql.createConnection(dbConfig);

db.connect((err: mysql.QueryError | null) => {
  if (err) {
    logger.error("Database connection error:", err);
    throw err;
  }
  logger.info("DB Connected");
});

export default db;
