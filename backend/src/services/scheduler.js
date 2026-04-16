const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const { calculateDynamicPrice } = require('../utils/dynamicPricing');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

// Every 5 minutes: update dynamic prices and deactivate expired offers
const startScheduler = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();

      // Deactivate expired offers
      const expired = await prisma.offer.updateMany({
        where: { isActive: true, pickupEnd: { lt: now } },
        data: { isActive: false },
      });
      if (expired.count > 0) {
        logger.info(`Deactivated ${expired.count} expired offers`);
      }

      // Update current prices for dynamic offers
      const activeOffers = await prisma.offer.findMany({
        where: { isActive: true, dynamicPricing: true },
      });

      for (const offer of activeOffers) {
        const newPrice = calculateDynamicPrice(offer);
        if (Math.abs(newPrice - offer.currentPrice) > 0.01) {
          await prisma.offer.update({
            where: { id: offer.id },
            data: { currentPrice: newPrice },
          });
        }
      }

      // Auto-cancel no-show orders (2 hours after pickup end)
      const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000);
      await prisma.order.updateMany({
        where: {
          status: 'CONFIRMED',
          offer: { pickupEnd: { lt: twoHoursAgo } },
        },
        data: { status: 'NO_SHOW' },
      });
    } catch (err) {
      logger.error('Scheduler error', { error: err.message });
    }
  });

  logger.info('Scheduler started');
};

module.exports = { startScheduler };
