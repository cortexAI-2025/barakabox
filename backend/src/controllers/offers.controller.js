const { PrismaClient } = require('@prisma/client');
const { success, created, error, paginated } = require('../utils/response');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { getBoundingBox, haversineDistance } = require('../utils/geo');
const { calculateDynamicPrice, getScarcityLevel } = require('../utils/dynamicPricing');
const { getRecommendedOffers } = require('../services/recommendation');
const { uploadImage } = require('../services/cloudinary');

const prisma = new PrismaClient();

const enrichOffer = (offer) => ({
  ...offer,
  currentPrice: calculateDynamicPrice(offer),
  scarcityLevel: getScarcityLevel(offer.remainingQuantity, offer.totalQuantity),
  isExpiringSoon: new Date(offer.pickupEnd) - Date.now() < 60 * 60 * 1000,
});

const getNearbyOffers = async (req, res, next) => {
  try {
    const { lat, lon, radius = 10, category, minPrice, maxPrice, page, limit } = req.query;
    if (!lat || !lon) return error(res, 'lat and lon are required', 400);

    const { page: pg, limit: lm, skip } = getPagination({ page, limit });
    const { minLat, maxLat, minLon, maxLon } = getBoundingBox(
      parseFloat(lat), parseFloat(lon), parseFloat(radius)
    );
    const now = new Date();

    const merchantWhere = {
      latitude: { gte: minLat, lte: maxLat },
      longitude: { gte: minLon, lte: maxLon },
      status: 'ACTIVE',
      ...(category && { category }),
    };

    const merchants = await prisma.merchant.findMany({
      where: merchantWhere,
      select: { id: true, latitude: true, longitude: true },
    });
    const merchantIds = merchants.map((m) => m.id);
    const merchantGeo = Object.fromEntries(merchants.map((m) => [m.id, m]));

    const offerWhere = {
      merchantId: { in: merchantIds },
      isActive: true,
      remainingQuantity: { gt: 0 },
      pickupEnd: { gt: now },
      ...(minPrice && { currentPrice: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { currentPrice: { lte: parseFloat(maxPrice) } }),
    };

    const [total, offers] = await Promise.all([
      prisma.offer.count({ where: offerWhere }),
      prisma.offer.findMany({
        where: offerWhere,
        include: {
          merchant: {
            select: {
              id: true, businessName: true, logo: true, address: true,
              latitude: true, longitude: true, category: true, rating: true, isFeatured: true,
            },
          },
        },
        orderBy: [{ merchant: { isFeatured: 'desc' } }, { pickupEnd: 'asc' }],
        skip,
        take: lm,
      }),
    ]);

    const enriched = offers.map((offer) => {
      const geo = merchantGeo[offer.merchantId];
      const distance = geo
        ? haversineDistance(parseFloat(lat), parseFloat(lon), geo.latitude, geo.longitude)
        : null;
      return { ...enrichOffer(offer), distance: distance ? Math.round(distance * 10) / 10 : null };
    });

    return paginated(res, enriched, buildPaginationMeta(total, pg, lm));
  } catch (err) {
    next(err);
  }
};

const getRecommended = async (req, res, next) => {
  try {
    const { lat, lon, radius = 10 } = req.query;
    if (!lat || !lon) return error(res, 'lat and lon are required', 400);

    const userId = req.user?.id;
    const offers = await getRecommendedOffers(
      userId, parseFloat(lat), parseFloat(lon), parseFloat(radius)
    );
    return success(res, offers.map(enrichOffer));
  } catch (err) {
    next(err);
  }
};

const getOffer = async (req, res, next) => {
  try {
    const offer = await prisma.offer.findUnique({
      where: { id: req.params.id },
      include: {
        merchant: {
          select: {
            id: true, businessName: true, logo: true, coverImage: true, address: true,
            city: true, phone: true, latitude: true, longitude: true,
            category: true, rating: true, totalReviews: true, description: true,
          },
        },
      },
    });
    if (!offer) return error(res, 'Offer not found', 404);
    return success(res, enrichOffer(offer));
  } catch (err) {
    next(err);
  }
};

const createOffer = async (req, res, next) => {
  try {
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return error(res, 'Merchant profile required', 403);
    if (merchant.status !== 'ACTIVE') return error(res, 'Merchant not active', 403);

    const {
      title, description, originalPrice, minPrice,
      totalQuantity, pickupStart, pickupEnd, dynamicPricing = true, tags = [],
    } = req.body;

    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadImage(req.file.path, 'barakabox/offers');
    }

    const offer = await prisma.offer.create({
      data: {
        merchantId: merchant.id,
        title, description, imageUrl,
        originalPrice: parseFloat(originalPrice),
        currentPrice: parseFloat(originalPrice),
        minPrice: parseFloat(minPrice),
        totalQuantity: parseInt(totalQuantity),
        remainingQuantity: parseInt(totalQuantity),
        pickupStart: new Date(pickupStart),
        pickupEnd: new Date(pickupEnd),
        dynamicPricing,
        tags,
      },
    });

    return created(res, offer, 'Offer created successfully');
  } catch (err) {
    next(err);
  }
};

const updateOffer = async (req, res, next) => {
  try {
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return error(res, 'Merchant not found', 403);

    const existing = await prisma.offer.findFirst({
      where: { id: req.params.id, merchantId: merchant.id },
    });
    if (!existing) return error(res, 'Offer not found', 404);

    const { title, description, totalQuantity, pickupStart, pickupEnd, isActive, tags } = req.body;

    let imageUrl = existing.imageUrl;
    if (req.file) imageUrl = await uploadImage(req.file.path, 'barakabox/offers');

    const offer = await prisma.offer.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(imageUrl && { imageUrl }),
        ...(totalQuantity && { totalQuantity: parseInt(totalQuantity) }),
        ...(pickupStart && { pickupStart: new Date(pickupStart) }),
        ...(pickupEnd && { pickupEnd: new Date(pickupEnd) }),
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(tags && { tags }),
      },
    });
    return success(res, offer);
  } catch (err) {
    next(err);
  }
};

const getMerchantOffers = async (req, res, next) => {
  try {
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return error(res, 'Merchant not found', 404);

    const { page, limit } = getPagination(req.query);
    const [total, offers] = await Promise.all([
      prisma.offer.count({ where: { merchantId: merchant.id } }),
      prisma.offer.findMany({
        where: { merchantId: merchant.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { orders: true } } },
      }),
    ]);

    return paginated(res, offers.map(enrichOffer), buildPaginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
};

module.exports = { getNearbyOffers, getRecommended, getOffer, createOffer, updateOffer, getMerchantOffers };
