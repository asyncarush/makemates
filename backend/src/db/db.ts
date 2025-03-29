import mysql, { Connection } from "mysql2";
import dotenv from "dotenv";
import { logger } from "../config/winston";

dotenv.config();

const dbConfig: any = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "makemates",
  port: Number(process.env.DB_PORT) || 5432,
};

console.log(dbConfig);
const db: Connection = mysql.createConnection(dbConfig);

function checkConnection() {
  return new Promise<Connection>((resolve, reject) => {
    db.connect((err: mysql.QueryError | null) => {
      if (err) {
        logger.error("Database connection error:", err);
        return reject(err);
      }
      logger.info("DB Connected");
      return resolve(db);
    });
  });
}
export default checkConnection;
