/**
 * @fileoverview Main application entry point.
 * Initializes Express server with middleware and routes.
 */

// Core dependencies
import express, { Application } from "express";
import dotenv from "dotenv";

// Security middleware
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

// Utility middleware
import compression from "compression";
import bodyParser from "body-parser";
import morgan from "morgan";

// Logging configuration
import { logger } from "./config/winston";

// Route definitions
import User from "./routes/user.routes";
import Post from "./routes/post.routes";
import Search from "./routes/search.routes";
import upload from "./routes/upload.routes";

import checkConnection from "./db/db";

const app: Application = express();
dotenv.config();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:9000",
      "http://192.168.49.2:30006",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Set-Cookie"],
    exposedHeaders: ["Set-Cookie"],
  })
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(compression());
app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// routes
app.use("/user", User);
app.use("/posts", Post);
app.use("/search", Search);
app.use("/", upload);

app.get("/health", (req, res) => {
  res.status(200).send("Chill , everything is working fine");
});

// check the if db is been initialized

const PORT: number = parseInt(process.env.PORT || "2000", 10);

async function startServer() {
  //check db connection here
  // check minio connection here

  try {
    app.listen(PORT, () => {
      logger.info(`Server listening on ${PORT}`);
    });
  } catch (err) {
    logger.error(err);
  }
}

startServer();
