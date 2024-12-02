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

const app: Application = express();
dotenv.config();

app.use(
  cors({
    origin: [
      "https://makemates-2024.vercel.app",
      "http://localhost:3000",
      "http://192.168.49.2:30005"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Set-Cookie"],
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

app.get("/health", (req, res) => {
  res.status(200).send("Chill , everything is working fine");
});

// routes
app.use("/user", User);
app.use("/posts", Post);
app.use("/search", Search);
app.use("/", upload);

const PORT: number = parseInt(process.env.PORT || "2000", 10);

app.listen(PORT, () => {
  logger.info(`Server listening on ${PORT}`);
});
