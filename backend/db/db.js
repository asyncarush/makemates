import mysql from "mysql2";
import dotenv from "dotenv";
import { logger } from "../winston.js";
dotenv.config();

const db = mysql.createConnection({
  host: "localhost",
  user: "arush",
  password: "Arush@123",
  database: "makemates",
  port: 3306,
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
