const { Server } = require("socket.io");
const config = require("../config/config");
const logger = require("./logger");

let io = null;

const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: config.CORS.ORIGIN,
      methods: config.CORS.METHODS,
      credentials: config.CORS.CREDENTIALS,
    },
  });

  io.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on("join:scheduler", (data) => {
      socket.join("scheduler");
      logger.info(`Socket ${socket.id} joined scheduler room`);
    });

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  logger.info("Socket.IO initialized successfully");
  return io;
};

const getIO = () => {
  if (!io) {
    logger.warn("Socket.IO not initialized");
    return null;
  }
  return io;
};

const emitAppointmentEvent = (event, data) => {
  const socketIO = getIO();
  if (socketIO) {
    socketIO.to("scheduler").emit(event, data);
    logger.info(`Socket event emitted: ${event}`);
  }
};

module.exports = { initializeSocket, getIO, emitAppointmentEvent };
