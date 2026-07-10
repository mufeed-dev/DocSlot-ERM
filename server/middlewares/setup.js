const { randomUUID } = require("crypto");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const express = require("express");
const config = require("../config/config");
const requestLogger = require("./requestLogger");
const cookieParser = require("cookie-parser");

const setupMiddleware = (app) => {
  app.set("trust proxy", 1);

  app.use((req, res, next) => {
    res.locals.requestId = randomUUID();
    next();
  });

  app.use(
    helmet({
      crossOriginResourcePolicy: {
        policy: "cross-origin",
      },
    }),
  );

  const corsOptions = {
    origin: config.CORS.ORIGIN,
    credentials: config.CORS.CREDENTIALS,
    optionsSuccessStatus: 200,
    methods: config.CORS.METHODS,
    allowedHeaders: config.CORS.ALLOWED_HEADERS,
  };
  app.use(cors(corsOptions));

  const limiter = rateLimit({
    windowMs: config.RATE_LIMIT.WINDOWMS,
    max: config.RATE_LIMIT.MAX,
    message: {
      success: false,
      message:
        "Too many requests from this IP, please try again after 15 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  app.use(requestLogger);

  app.use(cookieParser());

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  app.get("/health", (req, res) => {
    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      message: "Server is Live",
      uptime: process.uptime(),
      environment: config.NODE_ENV,
    });
  });
};

module.exports = { setupMiddleware };
