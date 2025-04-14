import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";
import bodyParser from "body-parser";
import morgan from "morgan";
import { logger } from "./winston";

export class ServerConfig {
  private app: Application;

  constructor() {
    this.app = express();
    this.setupMiddleware();
  }

  private setupMiddleware() {
    // CORS configuration
    this.app.use(
      cors({
        origin: [
          "http://localhost:3000",
          "https://makemates.vercel.app",
          "http://34.42.91.142:9000",
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Set-Cookie"],
        exposedHeaders: ["Set-Cookie"],
      })
    );

    // Development logging
    if (process.env.NODE_ENV === "development") {
      this.app.use(morgan("dev"));
    }

    // Security and performance middleware
    this.app.use(compression());
    this.app.use(helmet());
    this.app.use(cookieParser());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());

    // Health check endpoint
    this.app.get("/health", (req, res) => {
      res.status(200).send("Chill , everything is working fine");
    });
  }

  public getApp(): Application {
    return this.app;
  }
}
