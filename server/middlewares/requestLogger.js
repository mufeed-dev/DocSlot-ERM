const logger = require("../utils/logger");

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  logger.info(`Incoming request: ${req.originalUrl} ${req.method} - ${req.ip}`);

  res.on("finish", () => {
    const duration = Date.now() - startTime;

    logger.info(
      `Response completed: ${req.originalUrl} ${req.method} - ${res.statusCode} (${duration}ms)`,
    );
  });

  next();
};

module.exports = requestLogger;
