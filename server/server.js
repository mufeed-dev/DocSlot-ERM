require("dotenv").config();
const express = require("express");
const http = require("http");
const config = require("./config/config");
const dbConnection = require("./config/database");
const logger = require("./utils/logger");
const { setupMiddleware } = require("./middlewares/setup");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const { initializeSocket } = require("./utils/socket");

class Server {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.port = config.PORT;
  }

  async initialize() {
    try {
      // Connect to Database
      await dbConnection.connect();

      // Initialize Socket.IO
      initializeSocket(this.server);

      // Setup Middlewares
      setupMiddleware(this.app);

      // Error Handlers
      this.app.use(notFound);
      this.app.use(errorHandler);

      logger.info("Server initialized successfully");
    } catch (error) {
      logger.error("Server initialization failed", error.message);
      process.exit(1);
    }
  }

  async start() {
    await this.initialize();

    this.server
      .listen(this.port, () => {
        logger.info(`Server is running on port: ${this.port}`);
      })
      .on("error", (error) => {
        logger.error("Server error", error);
        process.exit(1);
      });

    this.setupGracefulShutdown();
  }

  setupGracefulShutdown() {
    const gracefulShutdown = async (signal) => {
      logger.info(`Graceful shutdown ${signal} received`);

      this.server.close(async () => {
        await dbConnection.disconnect();
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  }
}

const appServer = new Server();

appServer.start();
