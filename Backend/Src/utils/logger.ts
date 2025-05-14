import winston from "winston";
import path from "path";
import fs from "fs";

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format that includes timestamp and colorization
const customFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Configure the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: "motionframe-api" },
  transports: [
    // Write errors to their own file
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Write all logs to a combined file
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Console output for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        customFormat
      ),
    }),
  ],
});

// Add a simple logging wrapper to ensure console.logs are also captured
const enhancedLogger = {
  info: (message: string, meta?: any) => {
    console.log(message); // Duplicate to console
    logger.info(message, meta);
  },

  debug: (message: string, meta?: any) => {
    console.debug(message); // Duplicate to console
    logger.debug(message, meta);
  },

  warn: (message: string, meta?: any) => {
    console.warn(message); // Duplicate to console
    logger.warn(message, meta);
  },

  error: (message: string, meta?: any) => {
    console.error(message); // Duplicate to console
    logger.error(message, meta);
  },
};

// Log startup information
enhancedLogger.info("Logger initialized");

export default enhancedLogger;
