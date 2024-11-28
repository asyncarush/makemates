"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const morgan_1 = __importDefault(require("morgan"));
const User_1 = __importDefault(require("./routes/User"));
const Post_1 = __importDefault(require("./routes/Post"));
const Search_1 = __importDefault(require("./routes/Search"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const winston_1 = require("./config/winston");
const dotenv_1 = __importDefault(require("dotenv"));
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
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
    res.send("Chill , everything is working fine");
});
// routes
app.use("/user", User_1.default);
app.use("/posts", Post_1.default);
app.use("/search", Search_1.default);
app.use("/", upload_routes_1.default);
const PORT = parseInt(process.env.PORT || "2000", 10);
app.listen(PORT, () => {
    winston_1.logger.info(`Server listening on ${PORT}`);
});
