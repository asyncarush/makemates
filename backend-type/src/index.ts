import express, { Application } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import User from "./routes/User";
import Post from "./routes/Post";
import Search from "./routes/Search";
import cookieParser from "cookie-parser";
import { logger } from "./config/winston";
import dotenv from "dotenv";
import compression from "compression";
import helmet from "helmet";
import upload from "./routes/upload.routes";

const app: Application = express();
dotenv.config();

app.use(
  cors({
    origin: ["https://makemates-2024.vercel.app", "http://localhost:3000"],
    credentials: true,
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
  res.send("Chill , everything is working fine");
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
