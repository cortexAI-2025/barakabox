const QRCode = require('qrcode');
const { PrismaClient } = require('@prisma/client');
const { success, created, error, paginated } = require('../utils/response');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { calculateDynamicPrice } = require('../utils/dynamicPricing');
const { notifyOrderConfirmed, notifyOrderReady } = require('../services/notification');

const prisma = new PrismaClient();

const createOrder = async (req, res, next) => {
  try {
    const { offerId, quantity = 1, paymentMethod = 'CASH', notes } = req.body;

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { merchant: { select: { id: true, commission: true, status: true } } },
    });

    if (!offer || !offer.isActive) return error(res, 'Offer not available', 404);
    if (offer.merchant.status !== 'ACTIVE') return error(res, 'Merchant not available', 400);
    if (offer.remainingQuantity < quantity) return error(res, 'Not enough quantity available', 400);
    if (new Date(offer.pickupEnd) < new Date()) return error(res, 'Offer has expired', 400);

    const unitPrice = calculateDynamicPrice(offer);
    const totalPrice = Math.round(unitPrice * quantity * 100) / 100;
    const commission = Math.round(totalPrice * offer.merchant.commission * 100) / 100;

    const order = await prisma.$transaction(async (tx) => {
      await tx.offer.update({
        where: { id: offerId },
        data: { remainingQuantity: { decrement: quantity } },
      });

      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          merchantId: offer.merchant.id,
          offerId,
          quantity,
          unitPrice,
          totalPrice,
          commission,
          paymentMethod,
          notes,
          status: 'CONFIRMED',
          confirmedAt: new Date(),
        },
        include: {
          offer: { select: { title: true, pickupStart: true, pickupEnd: true } },
          merchant: { select: { businessName: true, address: true, phone: true } },
        },
      });

      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          amount: totalPrice,
          method: paymentMethod,
          status: paymentMethod === 'CASH' ? 'PENDING' : 'PAID',
        },
      });

      return newOrder;
    });

    const qrData = JSON.stringify({ orderId: order.id, qrCode: order.qrCode, userId: req.user.id });
    const qrCodeImage = await QRCode.toDataURL(qrData);

    await notifyOrderConfirmed(order);

    return created(res, { ...order, qrCodeImage }, 'Order placed successfully');
  } catch (err) {
    next(err);
  }
};

const getUserOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    const where = {
      userId: req.user.id,
      ...(status && { status }),
    };

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          offer: { select: { title: true, imageUrl: true, pickupStart: true, pickupEnd: true } },
          merchant: { select: { businessName: true, logo: true, address: true } },
          review: { select: { rating: true, comment: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return paginated(res, orders, buildPaginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
};

const getOrder = async (req, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: {
        offer: { select: { title: true, imageUrl: true, description: true, pickupStart: true, pickupEnd: true } },
        merchant: { select: { businessName: true, logo: true, address: true, latitude: true, longitude: true, phone: true } },
        payment: true,
        review: true,
      },
    });
    if (!order) return error(res, 'Order not found', 404);

    const qrData = JSON.stringify({ orderId: order.id, qrCode: order.qrCode, userId: req.user.id });
    const qrCodeImage = await QRCode.toDataURL(qrData);

    return success(res, { ...order, qrCodeImage });
  } catch (err) {
    next(err);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!order) return error(res, 'Order not found', 404);
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      return error(res, 'Order cannot be cancelled', 400);
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.offer.update({
        where: { id: order.offerId },
        data: { remainingQuantity: { increment: order.quantity } },
      });

      return tx.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED', cancelledAt: new Date() },
      });
    });

    return success(res, updated, 'Order cancelled');
  } catch (err) {
    next(err);
  }
};

// Merchant: scan QR and complete order
const completeOrder = async (req, res, next) => {
  try {
    const { qrCode } = req.body;
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return error(res, 'Merchant not found', 403);

    const order = await prisma.order.findFirst({
      where: { qrCode, merchantId: merchant.id },
    });
    if (!order) return error(res, 'Invalid QR code', 404);
    if (order.status !== 'CONFIRMED') return error(res, `Order is ${order.status}`, 400);

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        payment: { update: { status: 'PAID' } },
      },
    });

    await prisma.merchant.update({
      where: { id: merchant.id },
      data: { totalSales: { increment: 1 } },
    });

    return success(res, updated, 'Order completed');
  } catch (err) {
    next(err);
  }
};

const getMerchantOrders = async (req, res, next) => {
  try {
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return error(res, 'Merchant not found', 404);

    const { status } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    const where = {
      merchantId: merchant.id,
      ...(status && { status }),
    };

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true, phone: true } },
          offer: { select: { title: true } },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return paginated(res, orders, buildPaginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
};

const markReady = async (req, res, next) => {
  try {
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return error(res, 'Merchant not found', 403);

    const order = await prisma.order.findFirst({
      where: { id: req.params.id, merchantId: merchant.id, status: 'CONFIRMED' },
    });
    if (!order) return error(res, 'Order not found', 404);

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'READY' },
    });

    await notifyOrderReady(updated);
    return success(res, updated, 'Order marked as ready');
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getUserOrders, getOrder, cancelOrder, completeOrder, getMerchantOrders, markReady };
