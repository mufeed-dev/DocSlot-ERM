const { ErrorUtils } = require("./error");

class ResponseFormatter {
  static success(res, message, data, statusCode) {
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId || null,
      message,
    };

    if (data) response.data = data;

    return res.status(statusCode).json(response);
  }

  static error(res, error) {
    const formattedError = ErrorUtils.formatError(error);

    const response = {
      success: false,
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId || null,
      ...formattedError,
    };

    return res.status(formattedError.statusCode).json(response);
  }
}

const sendSuccess = (
  res,
  message = "Success",
  data = null,
  statusCode = 200,
) => {
  return ResponseFormatter.success(res, message, data, statusCode);
};

module.exports = { ResponseFormatter, sendSuccess };
