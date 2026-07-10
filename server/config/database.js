const logger = require("../utils/logger");
const mongoose = require("mongoose");
const config = require("./config");

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.setupEventListeners();
  }

  setupEventListeners() {
    mongoose.connection.on("error", (error) => {
      logger.error("Database error", error);
      this.isConnected = false;
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("Database reconnected");
      this.isConnected = true;
    });
    mongoose.connection.on("disconnected", () => {
      logger.info("Database disconnected");
      this.isConnected = false;
    });
  }

  async connect() {
    try {
      if (this.isConnected) {
        logger.info("Database already connected");
        return;
      }

      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
      };
      await mongoose.connect(config.MONGO_URI, options);
      logger.info("Database connected successfully");
      this.isConnected = true;
    } catch (error) {
      logger.error("Database connection error", error);
      process.exit(1);
    }
  }

  async disconnect() {
    try {
      await mongoose.connection.close();
      this.isConnected = false;
      logger.info("Database disconnected successfully");
    } catch (error) {
      logger.error("Database disconnection error", error);
      process.exit(1);
    }
  }
}

const dbConnection = new DatabaseConnection();

module.exports = dbConnection;
