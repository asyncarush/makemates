"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = require("winston");
// Create a logger instance
exports.logger = (0, winston_1.createLogger)({
    level: "info",
    format: winston_1.format.json(),
    transports: [new winston_1.transports.Console()],
});
