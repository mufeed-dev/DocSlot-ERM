const {
  ErrorUtils,
  AppError,
  NotFoundError,
  ConflictError,
} = require("../utils/error");
const logger = require("../utils/logger");
const { ResponseFormatter } = require("../utils/response");

const errorHandler = (err, req, res, next) => {
  ErrorUtils.logError(err, logger, {
    url: req.originalUrl,
    method: req.method,
    requestId: res.locals.requestId,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    const error = new ConflictError(message);
    return ResponseFormatter.error(res, error);
  }

  if (err instanceof AppError) {
    return ResponseFormatter.error(res, err);
  }

  const error = new AppError(
    err.message || "Internal Server Error",
    err.statusCode || 500,
    err.code || "INTERNAL_ERROR",
  );

  return ResponseFormatter.error(res, error);
};

const notFound = (req, res, next) => {
  const message = `Route ${req.originalUrl} not found`;

  logger.error(message, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  const error = new NotFoundError(message);
  return ResponseFormatter.error(res, error);
};

module.exports = { errorHandler, notFound };
