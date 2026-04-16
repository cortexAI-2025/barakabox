const { PrismaClient } = require('@prisma/client');
const { success, created, error, paginated } = require('../utils/response');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

const prisma = new PrismaClient();

const createReview = async (req, res, next) => {
  try {
    const { orderId, rating, comment } = req.body;

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user.id, status: 'COMPLETED' },
    });
    if (!order) return error(res, 'Order not found or not completed', 404);

    const existing = await prisma.review.findUnique({ where: { orderId } });
    if (existing) return error(res, 'Review already submitted', 409);

    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        orderId,
        merchantId: order.merchantId,
        rating: parseInt(rating),
        comment,
      },
    });

    // Recalculate merchant rating
    const agg = await prisma.review.aggregate({
      where: { merchantId: order.merchantId },
      _avg: { rating: true },
      _count: true,
    });

    await prisma.merchant.update({
      where: { id: order.merchantId },
      data: {
        rating: Math.round((agg._avg.rating || 0) * 10) / 10,
        totalReviews: agg._count,
      },
    });

    return created(res, review, 'Review submitted');
  } catch (err) {
    next(err);
  }
};

const getMerchantReviews = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const where = { merchantId: req.params.merchantId };
    const [total, reviews] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return paginated(res, reviews, buildPaginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
};

module.exports = { createReview, getMerchantReviews };
