module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",

  MONGO_URI: process.env.MONGO_URI,

  CORS: {
    ORIGIN: process.env.FRONTEND_URL,
    CREDENTIALS: true,
    METHODS: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    ALLOWED_HEADERS: ["Authorization", "Content-Type", "X-Requested-With"],
  },

  RATE_LIMIT: {
    WINDOWMS: 15 * 60 * 1000,
    MAX: 1000,
    AUTH_MAX: 10,
  },

  JWT: {
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "access_default_secret",
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "refresh_default_secret",
    ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  ADMIN: {
    EMAIL: process.env.ADMIN_EMAIL || "admin@docslot.com",
    PASSWORD: process.env.ADMIN_PASSWORD || "Admin@123",
    NAME: process.env.ADMIN_NAME || "Super Admin",
  },
};
