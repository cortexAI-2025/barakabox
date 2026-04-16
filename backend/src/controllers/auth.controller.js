const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');
const config = require('../config');
const { success, created, error } = require('../utils/response');

const prisma = new PrismaClient();

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
  const refreshToken = jwt.sign({ userId, jti: uuidv4() }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
  return { accessToken, refreshToken };
};

const register = async (req, res, next) => {
  try {
    const { email, phone, password, firstName, lastName, locale = 'fr' } = req.body;

    const existing = await prisma.user.findFirst({
      where: { OR: [email ? { email } : {}, phone ? { phone } : {}] },
    });
    if (existing) return error(res, 'User already exists with this email or phone', 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, phone, passwordHash, firstName, lastName, locale },
      select: { id: true, email: true, phone: true, firstName: true, lastName: true, role: true, referralCode: true },
    });

    const { accessToken, refreshToken } = generateTokens(user.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

    return created(res, { user, accessToken, refreshToken }, 'Account created successfully');
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;

    const user = await prisma.user.findFirst({
      where: { OR: [email ? { email } : undefined, phone ? { phone } : undefined].filter(Boolean) },
    });
    if (!user || !user.isActive) return error(res, 'Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return error(res, 'Invalid credentials', 401);

    const { accessToken, refreshToken } = generateTokens(user.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

    return success(res, {
      user: {
        id: user.id, email: user.email, phone: user.phone,
        firstName: user.firstName, lastName: user.lastName,
        role: user.role, locale: user.locale, avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return error(res, 'Refresh token required', 400);

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
      return error(res, 'Invalid or expired refresh token', 401);
    }

    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    const tokens = generateTokens(decoded.userId);

    await prisma.refreshToken.delete({ where: { token: refreshToken } });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await prisma.refreshToken.create({
      data: { token: tokens.refreshToken, userId: decoded.userId, expiresAt },
    });

    return success(res, tokens);
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    return success(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, email: true, phone: true, firstName: true, lastName: true,
        role: true, avatar: true, locale: true, walletBalance: true, referralCode: true,
        createdAt: true, merchant: { select: { id: true, businessName: true, status: true } },
      },
    });
    return success(res, user);
  } catch (err) {
    next(err);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const { firstName, lastName, locale, pushToken } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { firstName, lastName, locale, pushToken },
      select: { id: true, firstName: true, lastName: true, locale: true, avatar: true },
    });
    return success(res, user);
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return error(res, 'Current password is incorrect', 400);

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });
    await prisma.refreshToken.deleteMany({ where: { userId: req.user.id } });

    return success(res, null, 'Password changed. Please login again.');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refresh, logout, getMe, updateMe, changePassword };
