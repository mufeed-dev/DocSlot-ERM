const { ValidationError } = require("../utils/error");
const logger = require("../utils/logger");
const { sendSuccess } = require("../utils/response");

class BaseController {
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  static validateRequest(data, schema) {
    const { value, error } = schema.validate(data, { abortEarly: false });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message.replace(/['"]/g, ""),
      }));

      throw new ValidationError("Validation Failed", details);
    }

    return value;
  }

  static sendSuccessResponse(
    res,
    message = "Success",
    data = null,
    statusCode = 200,
  ) {
    return sendSuccess(res, message, data, statusCode);
  }

  static sendPaginatedResponse(
    res,
    data = [],
    pagination = {},
    message = "Success",
    statusCode = 200,
  ) {
    return res.status(statusCode).json({
      success: true,
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId || null,
      message,
      data,
      pagination,
    });
  }

  static logAction(action, details = {}) {
    logger.info(`Action: ${action}`, details);

    // Asynchronously log to the database
    const AuditService = require("../services/AuditService");
    AuditService.log({
      user: details.user ? details.user._id : details.userId || null,
      role: details.user ? details.user.role : details.role || "system",
      action,
      entity: details.entity || "System",
      entityId: details.entityId || null,
      details: details.extra || details,
      ipAddress: details.ipAddress || "",
    }).catch((err) => {
      logger.error("Audit log saving promise failed:", err.message);
    });
  }
}

module.exports = BaseController;
