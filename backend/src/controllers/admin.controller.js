const { PrismaClient } = require('@prisma/client');
const { success, error, paginated } = require('../utils/response');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

const prisma = new PrismaClient();

const getKPIs = async (req, res, next) => {
  try {
    const [
      totalUsers, totalMerchants, totalOrders, completedOrders,
      totalRevenue, pendingMerchants, activeOffers,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.merchant.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
      prisma.order.aggregate({ where: { status: 'COMPLETED' }, _sum: { totalPrice: true } }),
      prisma.merchant.count({ where: { status: 'PENDING' } }),
      prisma.offer.count({ where: { isActive: true, pickupEnd: { gt: new Date() } } }),
    ]);

    const conversionRate = totalOrders > 0 ? (completedOrders / totalOrders * 100).toFixed(1) : 0;

    return success(res, {
      users: { total: totalUsers },
      merchants: { total: totalMerchants, pending: pendingMerchants },
      orders: { total: totalOrders, completed: completedOrders, conversionRate: `${conversionRate}%` },
      revenue: { total: totalRevenue._sum.totalPrice || 0 },
      activeOffers,
    });
  } catch (err) {
    next(err);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const { search, role } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    const where = {
      ...(role && { role }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ],
      }),
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true, email: true, phone: true, firstName: true, lastName: true,
          role: true, isActive: true, createdAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
      }),
    ]);

    return paginated(res, users, buildPaginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { isActive, role } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { ...(typeof isActive === 'boolean' && { isActive }), ...(role && { role }) },
      select: { id: true, email: true, isActive: true, role: true },
    });
    return success(res, user);
  } catch (err) {
    next(err);
  }
};

const listMerchants = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    const where = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { businessName: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, merchants] = await Promise.all([
      prisma.merchant.count({ where }),
      prisma.merchant.findMany({
        where,
        include: {
          user: { select: { email: true, phone: true } },
          _count: { select: { offers: true, orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
      }),
    ]);

    return paginated(res, merchants, buildPaginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
};

const approveMerchant = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'SUSPENDED'].includes(status)) return error(res, 'Invalid status', 400);

    const merchant = await prisma.merchant.update({
      where: { id: req.params.id },
      data: { status },
    });
    return success(res, merchant, `Merchant ${status.toLowerCase()}`);
  } catch (err) {
    next(err);
  }
};

const setFeatured = async (req, res, next) => {
  try {
    const { isFeatured, featureUntil } = req.body;
    const merchant = await prisma.merchant.update({
      where: { id: req.params.id },
      data: {
        isFeatured,
        featureUntil: featureUntil ? new Date(featureUntil) : null,
      },
    });
    return success(res, merchant);
  } catch (err) {
    next(err);
  }
};

const listOrders = async (req, res, next) => {
  try {
    const { status, merchantId } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    const where = {
      ...(status && { status }),
      ...(merchantId && { merchantId }),
    };

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          merchant: { select: { businessName: true } },
          offer: { select: { title: true } },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
      }),
    ]);

    return paginated(res, orders, buildPaginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
};

const getConfig = async (req, res, next) => {
  try {
    const configs = await prisma.appConfig.findMany();
    const configMap = Object.fromEntries(configs.map((c) => [c.key, c.value]));
    return success(res, configMap);
  } catch (err) {
    next(err);
  }
};

const updateConfig = async (req, res, next) => {
  try {
    const { key, value } = req.body;
    const config = await prisma.appConfig.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
    return success(res, config);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getKPIs, listUsers, updateUser,
  listMerchants, approveMerchant, setFeatured,
  listOrders, getConfig, updateConfig,
};
