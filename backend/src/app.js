require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { setupSocket } = require('./socket');
const { startScheduler } = require('./services/scheduler');

const authRoutes = require('./routes/auth.routes');
const offerRoutes = require('./routes/offers.routes');
const orderRoutes = require('./routes/orders.routes');
const merchantRoutes = require('./routes/merchants.routes');
const reviewRoutes = require('./routes/reviews.routes');
const notificationRoutes = require('./routes/notifications.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: config.frontendUrl, credentials: true },
});

setupSocket(io);
app.set('io', io);

// Security
app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use(`/api/${config.apiVersion}`, limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.env !== 'test') {
  app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: config.env, version: process.env.npm_package_version || '1.0.0' });
});

// API routes
const apiBase = `/api/${config.apiVersion}`;
app.use(`${apiBase}/auth`, authRoutes);
app.use(`${apiBase}/offers`, offerRoutes);
app.use(`${apiBase}/orders`, orderRoutes);
app.use(`${apiBase}/merchants`, merchantRoutes);
app.use(`${apiBase}/reviews`, reviewRoutes);
app.use(`${apiBase}/notifications`, notificationRoutes);
app.use(`${apiBase}/admin`, adminRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Start
const PORT = config.port;
server.listen(PORT, () => {
  logger.info(`BarakaBox API running on port ${PORT} [${config.env}]`);
  startScheduler();
});

module.exports = { app, server };
