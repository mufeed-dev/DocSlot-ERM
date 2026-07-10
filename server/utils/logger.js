const winston = require("winston");
require("winston-daily-rotate-file");
const path = require("path");
const config = require("../config/config");

const logFormat = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const isVercel = process.env.VERCEL === "1";
const transports = [];

if (isVercel) {
  transports.push(
    new winston.transports.Console({
      format: logFormat,
    }),
  );
} else {
  const infoTransport = new winston.transports.DailyRotateFile({
    filename: path.join(__dirname, "../logs/info-%DATE%.log"),
    level: "info",
    zippedArchive: true,
    format: logFormat,
    maxFiles: "14d",
    maxSize: "20m",
  });

  const errorTransport = new winston.transports.DailyRotateFile({
    filename: path.join(__dirname, "../logs/error-%DATE%.log"),
    level: "error",
    zippedArchive: true,
    format: logFormat,
    maxFiles: "14d",
    maxSize: "20m",
  });

  transports.push(infoTransport, errorTransport);
  if (config.NODE_ENV === "development") {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
        ),
      }),
    );
  }
}

const logger = winston.createLogger({
  level: config.NODE_ENV === "development" ? "debug" : "info",
  format: logFormat,
  transports,
});

module.exports = logger;
