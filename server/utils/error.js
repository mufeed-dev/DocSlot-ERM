const config = require("../config/config");

class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);

    this.message = message;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message = "Validation failed", details = []) {
    super(message, 400, "VALIDATION_ERROR");
    this.details = details;
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource Not Found") {
    super(message, 404, "NOT_FOUND");
  }
}

class ConflictError extends AppError {
  constructor(message = "Resource Conflict") {
    super(message, 409, "CONFLICT_ERROR");
  }
}

class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(message, 401, "AUTHENTICATION_ERROR");
  }
}

class AuthorizationError extends AppError {
  constructor(message = "Access denied") {
    super(message, 403, "AUTHORIZATION_ERROR");
  }
}

class ErrorUtils {
  static isOperational(error) {
    return error instanceof AppError && error.isOperational;
  }

  static logError(err, logger, context = {}) {
    const error = {
      message: err.message,
      statusCode: err.statusCode,
      code: err.code,
      ...context,
    };

    if (err instanceof AppError && err.statusCode < 500) {
      logger.error("Operational Error:", error);
    } else {
      logger.error("System Error:", error);
    }
  }

  static formatError(error) {
    const message =
      error instanceof AppError ? error.message : "Internal Server Error";
    const statusCode =
      error.statusCode && typeof error.statusCode === "number"
        ? error.statusCode
        : 500;
    const code = error.code || "INTERNAL_ERROR";

    const formattedError = {
      message,
      statusCode,
      code,
    };

    if (error instanceof ValidationError && error.details) {
      formattedError.details = error.details;
    }
    if (config.NODE_ENV === "development") {
      formattedError.stack = error.stack;
    }

    return formattedError;
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  AuthenticationError,
  AuthorizationError,
  ErrorUtils,
};
