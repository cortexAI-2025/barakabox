const EARTH_RADIUS_KM = 6371;

const toRadians = (deg) => (deg * Math.PI) / 180;

// Haversine formula for distance between two coordinates
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Bounding box for efficient DB pre-filter before haversine
const getBoundingBox = (lat, lon, radiusKm) => {
  const latDelta = radiusKm / EARTH_RADIUS_KM * (180 / Math.PI);
  const lonDelta = latDelta / Math.cos(toRadians(lat));
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLon: lon - lonDelta,
    maxLon: lon + lonDelta,
  };
};

module.exports = { haversineDistance, getBoundingBox };
