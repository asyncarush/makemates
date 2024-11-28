import { createLogger, format, transports, Logger } from "winston";

// Create a logger instance
export const logger: Logger = createLogger({
  level: "info",
  format: format.json(),
  transports: [new transports.Console()],
});
