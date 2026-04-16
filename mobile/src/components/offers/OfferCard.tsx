import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../utils/theme';

interface Offer {
  id: string;
  title: string;
  imageUrl?: string;
  currentPrice: number;
  originalPrice: number;
  remainingQuantity: number;
  totalQuantity: number;
  pickupStart: string;
  pickupEnd: string;
  scarcityLevel: string;
  isExpiringSoon: boolean;
  distance?: number;
  merchant: {
    businessName: string;
    logo?: string;
    rating: number;
    category: string;
    isFeatured: boolean;
  };
}

interface Props {
  offer: Offer;
  onPress: () => void;
  horizontal?: boolean;
}

const Countdown: React.FC<{ end: string }> = ({ end }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = new Date(end).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Expiré'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [end]);

  return <Text style={styles.countdown}>{timeLeft}</Text>;
};

const scarcityColors: Record<string, string> = {
  critical: colors.error,
  low: '#FF6B35',
  medium: colors.warning,
  high: colors.success,
};

const OfferCard: React.FC<Props> = ({ offer, onPress, horizontal = false }) => {
  const { t } = useTranslation();
  const discount = Math.round((1 - offer.currentPrice / offer.originalPrice) * 100);

  return (
    <TouchableOpacity
      style={[styles.card, horizontal ? styles.horizontal : styles.vertical, shadows.md]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={horizontal ? styles.imageContainerH : styles.imageContainerV}>
        <Image
          source={{ uri: offer.imageUrl || 'https://via.placeholder.com/300x200/1A6B3C/FFF?text=🥗' }}
          style={horizontal ? styles.imageH : styles.imageV}
          resizeMode="cover"
        />
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{discount}%</Text>
        </View>
        {offer.merchant.isFeatured && (
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={10} color="#FFF" />
            <Text style={styles.featuredText}>Vedette</Text>
          </View>
        )}
        {offer.isExpiringSoon && (
          <View style={styles.urgentBadge}>
            <Ionicons name="time" size={10} color="#FFF" />
            <Text style={styles.urgentText}> Expire bientôt</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.merchantName} numberOfLines={1}>{offer.merchant.businessName}</Text>
        <Text style={styles.title} numberOfLines={2}>{offer.title}</Text>

        <View style={styles.row}>
          <View style={[styles.scarcityDot, { backgroundColor: scarcityColors[offer.scarcityLevel] }]} />
          <Text style={styles.quantity}>{offer.remainingQuantity} {t('offers.remaining')}</Text>
          {offer.distance != null && (
            <>
              <Text style={styles.dot}>·</Text>
              <Ionicons name="location" size={12} color={colors.textSecondary} />
              <Text style={styles.distance}>{offer.distance} {t('common.km')}</Text>
            </>
          )}
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.currentPrice}>{offer.currentPrice.toFixed(0)} MAD</Text>
            <Text style={styles.originalPrice}>{offer.originalPrice.toFixed(0)} MAD</Text>
          </View>
          <View style={styles.pickupInfo}>
            <Countdown end={offer.pickupEnd} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, overflow: 'hidden' },
  vertical: { width: 220, marginRight: spacing.md },
  horizontal: { flexDirection: 'row', marginBottom: spacing.md },

  imageContainerV: { position: 'relative' },
  imageContainerH: { position: 'relative', width: 120 },
  imageV: { width: '100%', height: 140 },
  imageH: { width: 120, height: 120 },

  discountBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: colors.error, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: borderRadius.round,
  },
  discountText: { color: '#FFF', fontSize: fontSizes.xs, fontWeight: '800' },
  featuredBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: colors.secondary, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: borderRadius.round, flexDirection: 'row', alignItems: 'center',
  },
  featuredText: { color: '#FFF', fontSize: 9, fontWeight: '700', marginLeft: 2 },
  urgentBadge: {
    position: 'absolute', bottom: 8, left: 8,
    backgroundColor: colors.error + 'EE', paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: borderRadius.round, flexDirection: 'row', alignItems: 'center',
  },
  urgentText: { color: '#FFF', fontSize: 9, fontWeight: '700' },

  content: { flex: 1, padding: spacing.sm + 2 },
  merchantName: { fontSize: fontSizes.xs, color: colors.textSecondary, fontWeight: '600', marginBottom: 2 },
  title: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },

  row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  scarcityDot: { width: 7, height: 7, borderRadius: 4, marginRight: 4 },
  quantity: { fontSize: fontSizes.xs, color: colors.textSecondary },
  dot: { marginHorizontal: 4, color: colors.textLight },
  distance: { fontSize: fontSizes.xs, color: colors.textSecondary },

  footer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 4 },
  currentPrice: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.primary },
  originalPrice: { fontSize: fontSizes.xs, color: colors.textLight, textDecorationLine: 'line-through' },
  pickupInfo: { alignItems: 'flex-end' },
  countdown: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.warning },
});

export default OfferCard;
