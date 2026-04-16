const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');

const connectedUsers = new Map(); // userId -> Set of socket IDs

const setupSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { userId } = socket;
    logger.debug(`Socket connected: ${socket.id} userId: ${userId}`);

    if (!connectedUsers.has(userId)) connectedUsers.set(userId, new Set());
    connectedUsers.get(userId).add(socket.id);

    socket.join(`user:${userId}`);

    socket.on('merchant:join', (merchantId) => {
      socket.join(`merchant:${merchantId}`);
    });

    socket.on('disconnect', () => {
      const userSockets = connectedUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) connectedUsers.delete(userId);
      }
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });
};

const emitToUser = (io, userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
};

const emitToMerchant = (io, merchantId, event, data) => {
  io.to(`merchant:${merchantId}`).emit(event, data);
};

module.exports = { setupSocket, emitToUser, emitToMerchant };
