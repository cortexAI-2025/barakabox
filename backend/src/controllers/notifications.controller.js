const { PrismaClient } = require('@prisma/client');
const { success, paginated } = require('../utils/response');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

const prisma = new PrismaClient();

const getNotifications = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const where = { userId: req.user.id };

    const [total, notifications] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
      }),
    ]);

    return paginated(res, notifications, buildPaginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    return success(res, null, 'Notifications marked as read');
  } catch (err) {
    next(err);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false },
    });
    return success(res, { count });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markAllRead, getUnreadCount };
