/**
 * Dynamic pricing reduces price as pickup window approaches expiry.
 * Price scales linearly from originalPrice -> minPrice over the offer lifetime.
 */
const calculateDynamicPrice = (offer) => {
  if (!offer.dynamicPricing) return offer.currentPrice;

  const now = Date.now();
  const start = new Date(offer.createdAt).getTime();
  const end = new Date(offer.pickupEnd).getTime();

  if (now >= end) return offer.minPrice;
  if (now <= start) return offer.originalPrice;

  const elapsed = now - start;
  const total = end - start;
  const ratio = elapsed / total; // 0 → 1 as time progresses

  // Linear decay from originalPrice to minPrice
  const price = offer.originalPrice - ratio * (offer.originalPrice - offer.minPrice);
  return Math.max(offer.minPrice, Math.round(price * 100) / 100);
};

// Scarcity multiplier: as quantity drops, add urgency (future: nudge users)
const getScarcityLevel = (remaining, total) => {
  const ratio = remaining / total;
  if (ratio <= 0.1) return 'critical';
  if (ratio <= 0.3) return 'low';
  if (ratio <= 0.6) return 'medium';
  return 'high';
};

module.exports = { calculateDynamicPrice, getScarcityLevel };
