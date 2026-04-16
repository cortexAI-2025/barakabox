import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Image, TouchableOpacity,
  FlatList, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { offersAPI } from '../../services/api';
import { useFavorites } from '../../hooks/useFavorites';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../../utils/theme';
import { Offer } from '../../components/offers/OfferCard';

const formatPickup = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  const now = new Date();
  const isToday = s.toDateString() === now.toDateString();
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = s.toDateString() === tomorrow.toDateString();
  const day = isToday ? "aujourd'hui" : isTomorrow ? 'demain' : s.toLocaleDateString('fr-FR', { weekday: 'short' });
  const fmt = (d: Date) => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `À récupérer ${day} : ${fmt(s)} - ${fmt(e)}`;
};

const FavoriteCard: React.FC<{
  offer: Offer;
  onPress: () => void;
  onRemove: () => void;
}> = ({ offer, onPress, onRemove }) => {
  const isSoldOut = offer.remainingQuantity === 0;
  const distStr = offer.distance != null
    ? (offer.distance < 1 ? `${Math.round(offer.distance * 1000)} m` : `${offer.distance.toFixed(1)} km`)
    : null;

  return (
    <TouchableOpacity style={[styles.favCard, shadows.sm]} onPress={onPress} activeOpacity={0.92}>
      {/* Food photo */}
      <View style={styles.favImageWrap}>
        <Image
          source={{ uri: offer.imageUrl || `https://picsum.photos/seed/${offer.id}/600/300` }}
          style={styles.favImage}
          resizeMode="cover"
        />
        {offer.merchant.isFeatured && (
          <View style={styles.champBadge}>
            <Text style={styles.champText}>Champion Anti-gaspi</Text>
          </View>
        )}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color={colors.primary} />
          <Text style={styles.ratingText}>{offer.merchant.rating.toFixed(1)}</Text>
        </View>
      </View>

      {/* Content below photo */}
      <View style={styles.favContent}>
        <View style={styles.favRow}>
          <Text style={styles.favMerchantName} numberOfLines={1}>
            {offer.merchant.businessName}
          </Text>
          <View style={styles.favActions}>
            <TouchableOpacity style={styles.bellBtn}>
              <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onRemove} style={styles.heartBtn}>
              <Ionicons name="heart" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.favOfferTitle} numberOfLines={1}>{offer.title}</Text>

        <View style={styles.favMeta}>
          <Text style={styles.favPickup} numberOfLines={1}>
            {formatPickup(offer.pickupStart, offer.pickupEnd)}
          </Text>
          {distStr && (
            <>
              <View style={styles.metaDot} />
              <Text style={styles.favDist}>{distStr}</Text>
            </>
          )}
        </View>

        <View style={styles.favDivider} />
        <View style={styles.favPriceRow}>
          <Text style={styles.favOriginalPrice}>
            {offer.originalPrice.toFixed(2).replace('.', ',')} MAD
          </Text>
          <Text style={styles.favCurrentPrice}>
            {isSoldOut ? 'Épuisé' : `${offer.currentPrice.toFixed(2).replace('.', ',')} MAD`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const EpuiseBanner: React.FC = () => (
  <View style={styles.epuiseBanner}>
    <View style={styles.epuiseLeft}>
      <Text style={styles.epuiseTitle}>ÉPUISÉ?{'\n'}RECEVOIR UNE{'\n'}NOTIFICATION</Text>
    </View>
    <View style={styles.epuiseBadge}>
      <Text style={styles.epuiseBadgeText}>Nouveau</Text>
    </View>
  </View>
);

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { favorites, toggle } = useFavorites();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const favIds = [...favorites];

  const fetchFavoriteOffers = useCallback(async () => {
    if (favIds.length === 0) { setOffers([]); return; }
    setLoading(true);
    try {
      const results = await Promise.allSettled(
        favIds.map((id) => offersAPI.getById(id))
      );
      const loaded = results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
        .map((r) => r.value.data.data);
      setOffers(loaded);
    } catch { /* silent */ }
    finally { setLoading(false); setRefreshing(false); }
  }, [favIds.join(',')]);

  useEffect(() => { fetchFavoriteOffers(); }, [favIds.length]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favoris</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : favIds.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🤍</Text>
          <Text style={styles.emptyTitle}>Aucun favori</Text>
          <Text style={styles.emptySub}>
            Appuyez sur ♡ sur n'importe quelle offre pour l'ajouter à vos favoris
          </Text>
          <TouchableOpacity
            style={styles.discoverBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.discoverBtnText}>Découvrir des offres</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchFavoriteOffers(); }} tintColor={colors.primary} />
          }
        >
          {offers.map((offer) => (
            <FavoriteCard
              key={offer.id}
              offer={offer}
              onPress={() => navigation.navigate('OfferDetail', { offerId: offer.id })}
              onRemove={() => toggle(offer.id)}
            />
          ))}

          {/* Épuisé notification banner */}
          <EpuiseBanner />

          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1, marginTop: 80 },

  header: {
    paddingTop: 56, paddingBottom: spacing.md, paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: fontSizes.xxl, fontWeight: '900', color: colors.text },

  list: { padding: spacing.lg },

  favCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    overflow: 'hidden', marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  favImageWrap: { position: 'relative', height: 170 },
  favImage: { width: '100%', height: '100%' },
  champBadge: {
    position: 'absolute', top: spacing.sm, left: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: borderRadius.round,
  },
  champText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.primary },
  ratingBadge: {
    position: 'absolute', top: spacing.sm, right: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: borderRadius.round, flexDirection: 'row', alignItems: 'center', gap: 3,
  },
  ratingText: { fontSize: fontSizes.xs, fontWeight: '800', color: colors.text },

  favContent: { padding: spacing.md },
  favRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  favMerchantName: { fontSize: fontSizes.md, fontWeight: '800', color: colors.text, flex: 1 },
  favActions: { flexDirection: 'row', gap: spacing.sm },
  bellBtn: { padding: 2 },
  heartBtn: { padding: 2 },

  favOfferTitle: { fontSize: fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  favMeta: { flexDirection: 'row', alignItems: 'center' },
  favPickup: { fontSize: fontSizes.xs, color: colors.textSecondary },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.textLight, marginHorizontal: 5 },
  favDist: { fontSize: fontSizes.xs, color: colors.textSecondary },

  favDivider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.sm, borderStyle: 'dashed' },
  favPriceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: spacing.sm },
  favOriginalPrice: { fontSize: fontSizes.xs, color: colors.textLight, textDecorationLine: 'line-through' },
  favCurrentPrice: { fontSize: fontSizes.lg, fontWeight: '900', color: colors.text },

  epuiseBanner: {
    backgroundColor: '#E8F5EE', borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.md,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    borderWidth: 1, borderColor: colors.primary + '20',
  },
  epuiseLeft: { flex: 1 },
  epuiseTitle: { fontSize: fontSizes.xl, fontWeight: '900', color: colors.primaryDark, lineHeight: 26 },
  epuiseBadge: {
    backgroundColor: colors.primary, paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4, borderRadius: borderRadius.round,
  },
  epuiseBadgeText: { fontSize: fontSizes.xs, fontWeight: '700', color: '#FFF' },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyIcon: { fontSize: 64, marginBottom: spacing.md },
  emptyTitle: { fontSize: fontSizes.xl, fontWeight: '800', color: colors.text, marginBottom: spacing.xs },
  emptySub: { fontSize: fontSizes.sm, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: spacing.xl },
  discoverBtn: {
    backgroundColor: colors.primary, paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md, borderRadius: borderRadius.round,
  },
  discoverBtnText: { color: '#FFF', fontWeight: '700', fontSize: fontSizes.md },
});

export default FavoritesScreen;
