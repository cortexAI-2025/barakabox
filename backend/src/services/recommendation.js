const { PrismaClient } = require('@prisma/client');
const { getBoundingBox, haversineDistance } = require('../utils/geo');

const prisma = new PrismaClient();

/**
 * Basic collaborative-style recommendation engine.
 * Scores offers by: proximity + category affinity + freshness + scarcity urgency.
 */
const getRecommendedOffers = async (userId, lat, lon, radiusKm = 10, limit = 10) => {
  const now = new Date();
  const { minLat, maxLat, minLon, maxLon } = getBoundingBox(lat, lon, radiusKm);

  // Get user's order history for category affinity
  const userOrders = await prisma.order.findMany({
    where: { userId, status: 'COMPLETED' },
    include: { offer: { select: { tags: true } }, merchant: { select: { category: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const preferredCategories = {};
  for (const order of userOrders) {
    const cat = order.merchant.category;
    preferredCategories[cat] = (preferredCategories[cat] || 0) + 1;
  }

  const merchants = await prisma.merchant.findMany({
    where: {
      latitude: { gte: minLat, lte: maxLat },
      longitude: { gte: minLon, lte: maxLon },
      status: 'ACTIVE',
    },
    select: { id: true, latitude: true, longitude: true, category: true, isFeatured: true },
  });

  const merchantIds = merchants.map((m) => m.id);
  const merchantMap = Object.fromEntries(merchants.map((m) => [m.id, m]));

  const offers = await prisma.offer.findMany({
    where: {
      merchantId: { in: merchantIds },
      isActive: true,
      remainingQuantity: { gt: 0 },
      pickupEnd: { gt: now },
    },
    include: {
      merchant: {
        select: {
          id: true, businessName: true, logo: true, address: true,
          latitude: true, longitude: true, category: true, isFeatured: true, rating: true,
        },
      },
    },
  });

  const scored = offers.map((offer) => {
    const merchant = merchantMap[offer.merchantId];
    const distance = haversineDistance(lat, lon, merchant.latitude, merchant.longitude);
    const proximityScore = Math.max(0, 1 - distance / radiusKm);
    const categoryScore = (preferredCategories[merchant.category] || 0) / 10;
    const timeLeft = (new Date(offer.pickupEnd) - now) / (1000 * 60 * 60); // hours
    const urgencyScore = timeLeft < 1 ? 0.5 : timeLeft < 3 ? 0.3 : 0;
    const scarcityScore = 1 - offer.remainingQuantity / offer.totalQuantity;
    const featuredBoost = merchant.isFeatured ? 0.2 : 0;

    const score =
      proximityScore * 0.4 +
      categoryScore * 0.2 +
      urgencyScore * 0.2 +
      scarcityScore * 0.1 +
      featuredBoost +
      Math.random() * 0.05; // slight randomization to avoid staleness

    return { ...offer, distance: Math.round(distance * 10) / 10, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

module.exports = { getRecommendedOffers };
