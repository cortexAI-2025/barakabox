import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../utils/theme';

export interface Offer {
  id: string;
  title: string;
  imageUrl?: string;
  currentPrice: number;
  originalPrice: number;
  remainingQuantity: number;
  totalQuantity: number;
  pickupStart: string;
  pickupEnd: string;
  scarcityLevel?: string;
  isExpiringSoon?: boolean;
  distance?: number;
  merchant: {
    id: string;
    businessName: string;
    logo?: string;
    rating: number;
    totalReviews?: number;
    category: string;
    isFeatured: boolean;
    address?: string;
  };
}

interface Props {
  offer: Offer;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  variant?: 'list' | 'compact';
}

const formatPickup = (start: string, end: string): string => {
  const now = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);
  const isToday = startDate.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = startDate.toDateString() === tomorrow.toDateString();
  const label = isToday ? "aujourd'hui" : isTomorrow ? 'demain' : startDate.toLocaleDateString('fr-FR', { weekday: 'long' });
  const fmt = (d: Date) => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `À récupérer ${label} : ${fmt(startDate)} - ${fmt(endDate)}`;
};

const BADGE_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  featured: { label: 'Champion Anti-gaspi', bg: 'rgba(255,255,255,0.92)', color: colors.primary },
  expiring: { label: 'Expire bientôt', bg: colors.error, color: '#FFF' },
  popular: { label: 'Populaire', bg: 'rgba(255,255,255,0.92)', color: colors.text },
  last: { label: 'Dernière chance', bg: colors.secondary, color: colors.text },
};

const OfferCard: React.FC<Props> = ({
  offer, onPress, isFavorite = false, onToggleFavorite, variant = 'list',
}) => {
  const heartScale = useRef(new Animated.Value(1)).current;
  const discount = Math.round((1 - offer.currentPrice / offer.originalPrice) * 100);

  const badge =
    offer.isExpiringSoon ? 'expiring'
    : offer.remainingQuantity === 1 ? 'last'
    : offer.merchant.isFeatured ? 'featured'
    : offer.remainingQuantity / offer.totalQuantity < 0.3 ? 'popular'
    : null;

  const badgeConf = badge ? BADGE_CONFIG[badge] : null;

  const handleFavorite = () => {
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.4, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onToggleFavorite?.(offer.id);
  };

  const isGiftIcon = offer.merchant.isFeatured; // use gift icon for exclusive offers

  return (
    <TouchableOpacity
      style={[styles.card, variant === 'compact' && styles.cardCompact, shadows.md]}
      onPress={onPress}
      activeOpacity={0.92}
    >
      {/* Photo with overlay */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: offer.imageUrl || `https://picsum.photos/seed/${offer.id}/600/300` }}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Dark gradient overlay bottom */}
        <View style={styles.imageGradient} />

        {/* Merchant logo + name overlay */}
        <View style={styles.merchantOverlay}>
          <View style={styles.merchantLogoWrap}>
            <Image
              source={{ uri: offer.merchant.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(offer.merchant.businessName)}&background=1A5C35&color=fff&size=80` }}
              style={styles.merchantLogo}
            />
          </View>
          <Text style={styles.merchantOverlayName} numberOfLines={1}>
            {offer.merchant.businessName}
          </Text>
        </View>

        {/* Top-left badge */}
        {badgeConf && (
          <View style={[styles.badge, { backgroundColor: badgeConf.bg }]}>
            <Text style={[styles.badgeText, { color: badgeConf.color }]}>{badgeConf.label}</Text>
          </View>
        )}

        {/* Heart button */}
        <Animated.View style={[styles.heartBtn, { transform: [{ scale: heartScale }] }]}>
          <TouchableOpacity onPress={handleFavorite} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? colors.error : '#FFF'}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Card content */}
      <View style={styles.content}>
        <Text style={styles.offerTitle} numberOfLines={1}>{offer.title}</Text>
        <Text style={styles.pickupTime} numberOfLines={1}>
          {formatPickup(offer.pickupStart, offer.pickupEnd)}
        </Text>

        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Ionicons name="star" size={13} color={colors.primary} />
            <Text style={styles.rating}>{offer.merchant.rating.toFixed(1)}</Text>
            {offer.distance != null && (
              <>
                <View style={styles.footerDot} />
                <Text style={styles.distance}>{offer.distance < 1 ? `${Math.round(offer.distance * 1000)} m` : `${offer.distance.toFixed(1)} km`}</Text>
              </>
            )}
          </View>

          <View style={styles.priceBlock}>
            {isGiftIcon && <Ionicons name="gift-outline" size={14} color={colors.primary} style={{ marginRight: 3 }} />}
            <Text style={styles.originalPrice}>{offer.originalPrice.toFixed(2).replace('.', ',')} MAD</Text>
            <Text style={styles.currentPrice}> {offer.currentPrice.toFixed(2).replace('.', ',')} MAD</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  cardCompact: { marginBottom: spacing.sm },

  imageContainer: { position: 'relative', height: 180 },
  image: { width: '100%', height: '100%' },
  imageGradient: {
    ...StyleSheet.absoluteFillObject,
    bottom: 0, top: '40%',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  merchantOverlay: {
    position: 'absolute', bottom: spacing.sm, left: spacing.sm,
    flexDirection: 'row', alignItems: 'center',
  },
  merchantLogoWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surface, overflow: 'hidden',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)',
  },
  merchantLogo: { width: '100%', height: '100%' },
  merchantOverlayName: {
    color: '#FFF', fontWeight: '800', fontSize: fontSizes.sm,
    marginLeft: spacing.xs, textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
    maxWidth: 220,
  },

  badge: {
    position: 'absolute', top: spacing.sm, left: spacing.sm,
    paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: borderRadius.round,
  },
  badgeText: { fontSize: fontSizes.xs, fontWeight: '700' },

  heartBtn: {
    position: 'absolute', top: spacing.sm, right: spacing.sm,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },

  content: { padding: spacing.md, paddingTop: spacing.sm + 2 },
  offerTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text, marginBottom: 3 },
  pickupTime: { fontSize: fontSizes.xs, color: colors.textSecondary, marginBottom: spacing.sm },

  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.text },
  footerDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.textLight },
  distance: { fontSize: fontSizes.sm, color: colors.textSecondary },

  priceBlock: { flexDirection: 'row', alignItems: 'center' },
  originalPrice: {
    fontSize: fontSizes.xs, color: colors.textLight,
    textDecorationLine: 'line-through',
  },
  currentPrice: { fontSize: fontSizes.md, fontWeight: '900', color: colors.text },
});

export default OfferCard;
