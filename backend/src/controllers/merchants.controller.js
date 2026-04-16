const { PrismaClient } = require('@prisma/client');
const { success, created, error, paginated } = require('../utils/response');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { uploadImage } = require('../services/cloudinary');

const prisma = new PrismaClient();

const createMerchant = async (req, res, next) => {
  try {
    const existing = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (existing) return error(res, 'Merchant profile already exists', 409);

    const { businessName, description, category, address, city, latitude, longitude, phone } = req.body;

    let logo = null, coverImage = null;
    if (req.files?.logo?.[0]) logo = await uploadImage(req.files.logo[0].path, 'barakabox/merchants');
    if (req.files?.cover?.[0]) coverImage = await uploadImage(req.files.cover[0].path, 'barakabox/merchants');

    const merchant = await prisma.merchant.create({
      data: {
        userId: req.user.id,
        businessName, description, category, address, city, phone,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        logo, coverImage,
        commission: parseFloat(process.env.DEFAULT_COMMISSION_RATE || '0.15'),
      },
    });

    // Update user role
    await prisma.user.update({ where: { id: req.user.id }, data: { role: 'MERCHANT' } });

    return created(res, merchant, 'Merchant profile created. Pending admin approval.');
  } catch (err) {
    next(err);
  }
};

const getMerchantProfile = async (req, res, next) => {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: { userId: req.user.id },
      include: {
        _count: { select: { offers: true, orders: true } },
      },
    });
    if (!merchant) return error(res, 'Merchant profile not found', 404);
    return success(res, merchant);
  } catch (err) {
    next(err);
  }
};

const updateMerchantProfile = async (req, res, next) => {
  try {
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return error(res, 'Merchant not found', 404);

    const { businessName, description, category, address, city, phone } = req.body;

    let logo = merchant.logo, coverImage = merchant.coverImage;
    if (req.files?.logo?.[0]) logo = await uploadImage(req.files.logo[0].path, 'barakabox/merchants');
    if (req.files?.cover?.[0]) coverImage = await uploadImage(req.files.cover[0].path, 'barakabox/merchants');

    const updated = await prisma.merchant.update({
      where: { id: merchant.id },
      data: {
        ...(businessName && { businessName }),
        ...(description && { description }),
        ...(category && { category }),
        ...(address && { address }),
        ...(city && { city }),
        ...(phone && { phone }),
        logo, coverImage,
      },
    });
    return success(res, updated);
  } catch (err) {
    next(err);
  }
};

const getMerchantPublic = async (req, res, next) => {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id: req.params.id },
      include: {
        offers: {
          where: { isActive: true, remainingQuantity: { gt: 0 }, pickupEnd: { gt: new Date() } },
          orderBy: { pickupEnd: 'asc' },
          take: 10,
        },
        _count: { select: { orders: { where: { status: 'COMPLETED' } } } },
      },
    });
    if (!merchant || merchant.status !== 'ACTIVE') return error(res, 'Merchant not found', 404);
    return success(res, merchant);
  } catch (err) {
    next(err);
  }
};

const getMerchantAnalytics = async (req, res, next) => {
  try {
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return error(res, 'Merchant not found', 404);

    const [totalOrders, completedOrders, revenue, topOffers, recentOrders] = await Promise.all([
      prisma.order.count({ where: { merchantId: merchant.id } }),
      prisma.order.count({ where: { merchantId: merchant.id, status: 'COMPLETED' } }),
      prisma.order.aggregate({
        where: { merchantId: merchant.id, status: 'COMPLETED' },
        _sum: { totalPrice: true, commission: true },
      }),
      prisma.order.groupBy({
        by: ['offerId'],
        where: { merchantId: merchant.id, status: 'COMPLETED' },
        _count: true,
        orderBy: { _count: { offerId: 'desc' } },
        take: 5,
      }),
      prisma.order.findMany({
        where: { merchantId: merchant.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { firstName: true, lastName: true } }, offer: { select: { title: true } } },
      }),
    ]);

    return success(res, {
      totalOrders,
      completedOrders,
      revenue: revenue._sum.totalPrice || 0,
      commissionPaid: revenue._sum.commission || 0,
      netRevenue: (revenue._sum.totalPrice || 0) - (revenue._sum.commission || 0),
      topOffers,
      recentOrders,
      rating: merchant.rating,
      totalReviews: merchant.totalReviews,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createMerchant, getMerchantProfile, updateMerchantProfile,
  getMerchantPublic, getMerchantAnalytics,
};
