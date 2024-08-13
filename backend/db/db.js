import mysql from "mysql2";
import dotenv from "dotenv";
import { logger } from "../winston.js";
dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// const db = mysql.createConnection({
//   host: "localhost",
//   user: "archer",
//   password: "password",
//   database: "makemates",
// });

db.connect(function (err) {
  if (err) throw err;
  logger.info("DB Connected");
});

export default db;
