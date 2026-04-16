const admin = require('firebase-admin');
const config = require('../config');
const logger = require('../utils/logger');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

let firebaseInitialized = false;

const initFirebase = () => {
  if (firebaseInitialized || !config.firebase.projectId) return;
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        privateKey: config.firebase.privateKey,
        clientEmail: config.firebase.clientEmail,
      }),
    });
    firebaseInitialized = true;
  } catch (err) {
    logger.warn('Firebase not initialized — push notifications disabled', { error: err.message });
  }
};

initFirebase();

const sendPushNotification = async (pushToken, title, body, data = {}) => {
  if (!firebaseInitialized || !pushToken) return;
  try {
    await admin.messaging().send({
      token: pushToken,
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    });
  } catch (err) {
    logger.error('Push notification failed', { error: err.message });
  }
};

const createNotification = async (userId, title, body, type, data = null) => {
  await prisma.notification.create({
    data: { userId, title, body, type, data },
  });
};

const notifyOrderConfirmed = async (order) => {
  const user = await prisma.user.findUnique({
    where: { id: order.userId },
    select: { pushToken: true },
  });
  await createNotification(
    order.userId,
    'Order Confirmed!',
    `Your order #${order.id.slice(-6).toUpperCase()} is confirmed. Pick it up soon!`,
    'ORDER_CONFIRMED',
    { orderId: order.id }
  );
  if (user?.pushToken) {
    await sendPushNotification(
      user.pushToken,
      'Order Confirmed!',
      `Your Baraka Box is ready for pickup!`,
      { orderId: order.id, type: 'ORDER_CONFIRMED' }
    );
  }
};

const notifyOrderReady = async (order) => {
  const user = await prisma.user.findUnique({
    where: { id: order.userId },
    select: { pushToken: true },
  });
  await createNotification(
    order.userId,
    'Ready for Pickup!',
    'Your Baraka Box is ready. Show your QR code to the merchant.',
    'ORDER_READY',
    { orderId: order.id }
  );
  if (user?.pushToken) {
    await sendPushNotification(user.pushToken, 'Ready for Pickup!', 'Show your QR code!', {
      orderId: order.id,
      type: 'ORDER_READY',
    });
  }
};

module.exports = { sendPushNotification, createNotification, notifyOrderConfirmed, notifyOrderReady };
