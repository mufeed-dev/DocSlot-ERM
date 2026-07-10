const config = require("../config/config");
const { createAuthLimiter } = require("../middlewares/setup");
const authRoutes = require("./auth");

const setupRoutes = (app) => {
  const authLimiter = createAuthLimiter();
  const shouldUseLimiter = config.NODE_ENV === "production";

  // Auth Limiter applied in production
  app.use("/api/v1/auth", shouldUseLimiter ? authLimiter : [], authRoutes);
};

module.exports = setupRoutes;
