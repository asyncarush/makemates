"use strict";
/**
 * @fileoverview Main application entry point.
 * Initializes Express server with middleware and routes.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Core dependencies
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
// Security middleware
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// Utility middleware
const compression_1 = __importDefault(require("compression"));
const body_parser_1 = __importDefault(require("body-parser"));
const morgan_1 = __importDefault(require("morgan"));
// Logging configuration
const winston_1 = require("./config/winston");
// Route definitions
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const post_routes_1 = __importDefault(require("./routes/post.routes"));
const search_routes_1 = __importDefault(require("./routes/search.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const app = (0, express_1.default)();
dotenv_1.default.config();
app.use((0, cors_1.default)({
    origin: ["https://makemates-2024.vercel.app", "http://localhost:3000"],
    credentials: true,
}));
if (process.env.NODE_ENV === "development") {
    app.use((0, morgan_1.default)("dev"));
}
app.use((0, compression_1.default)());
app.use((0, helmet_1.default)());
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.get("/health", (req, res) => {
    res.status(200).send("Chill , everything is working fine");
});
// routes
app.use("/user", user_routes_1.default);
app.use("/posts", post_routes_1.default);
app.use("/search", search_routes_1.default);
app.use("/", upload_routes_1.default);
const PORT = parseInt(process.env.PORT || "2000", 10);
app.listen(PORT, () => {
    winston_1.logger.info(`Server listening on ${PORT}`);
});
