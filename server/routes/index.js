const config = require("../config/config");
const { createAuthLimiter } = require("../middlewares/setup");
const authRoutes = require("./auth");
const doctorRoutes = require("./doctor");
const scheduleRoutes = require("./schedule");
const slotRoutes = require("./slot");

const setupRoutes = (app) => {
  const authLimiter = createAuthLimiter();
  const shouldUseLimiter = config.NODE_ENV === "production";

  // Auth Limiter applied in production
  app.use("/api/v1/auth", shouldUseLimiter ? authLimiter : [], authRoutes);

  app.use("/api/v1/doctors", doctorRoutes);
  app.use("/api/v1/schedules", scheduleRoutes);
  app.use("/api/v1/slots", slotRoutes);
};

module.exports = setupRoutes;
