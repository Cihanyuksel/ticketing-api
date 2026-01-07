import winston from "winston";
import path from "path";

const consoleFormat = winston.format.printf(
  ({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  }
);

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), consoleFormat),
    }),

    new winston.transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
    }),

    new winston.transports.File({
      filename: path.join("logs", "combined.log"),
    }),
  ],
});

export default logger;
