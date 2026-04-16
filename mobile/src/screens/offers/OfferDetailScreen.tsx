import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, StyleSheet,
  TouchableOpacity, ActivityIndicator, Alert, Share,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { offersAPI, reviewsAPI } from '../../services/api';
import Button from '../../components/common/Button';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../../utils/theme';
import { useAppSelector } from '../../store';

const OfferDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user } = useAppSelector((s) => s.auth);
  const { offerId } = route.params;

  const [offer, setOffer] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchOffer();
  }, [offerId]);

  const fetchOffer = async () => {
    try {
      const res = await offersAPI.getById(offerId);
      setOffer(res.data.data);
      const rev = await reviewsAPI.getMerchantReviews(res.data.data.merchant.id, { limit: 3 });
      setReviews(rev.data.data || []);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de charger l\'offre');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleBook = () => {
    if (!user) {
      Alert.alert('Connexion requise', 'Connectez-vous pour réserver', [
        { text: 'Annuler' },
        { text: 'Se connecter', onPress: () => navigation.navigate('Auth', { screen: 'Login' }) },
      ]);
      return;
    }
    navigation.navigate('Booking', { offer });
  };

  const handleShare = async () => {
    await Share.share({
      message: `Découvrez cette offre sur BarakaBox: ${offer.title} à seulement ${offer.currentPrice} MAD!`,
    });
  };

  if (loading || !offer) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  const discount = Math.round((1 - offer.currentPrice / offer.originalPrice) * 100);
  const timeLeft = new Date(offer.pickupEnd).getTime() - Date.now();
  const hoursLeft = Math.floor(timeLeft / 3600000);
  const minutesLeft = Math.floor((timeLeft % 3600000) / 60000);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: offer.imageUrl || 'https://via.placeholder.com/400x250/1A6B3C/FFF?text=🥗' }}
            style={styles.heroImage}
          />
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
            <Ionicons name="share-outline" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discount}%</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Merchant */}
          <TouchableOpacity
            style={styles.merchantRow}
            onPress={() => navigation.navigate('MerchantDetail', { merchantId: offer.merchant.id })}
          >
            <Image
              source={{ uri: offer.merchant.logo || 'https://via.placeholder.com/50/1A6B3C/FFF?text=B' }}
              style={styles.merchantLogo}
            />
            <View style={styles.merchantInfo}>
              <Text style={styles.merchantName}>{offer.merchant.businessName}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={13} color={colors.secondary} />
                <Text style={styles.rating}>{offer.merchant.rating.toFixed(1)}</Text>
                <Text style={styles.reviewCount}>({offer.merchant.totalReviews})</Text>
                <Text style={styles.category}> · {offer.merchant.category}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Offer Title & Price */}
          <Text style={styles.title}>{offer.title}</Text>
          <Text style={styles.description}>{offer.description}</Text>

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.currentPrice}>{offer.currentPrice.toFixed(0)} MAD</Text>
              <Text style={styles.originalPrice}>au lieu de {offer.originalPrice.toFixed(0)} MAD</Text>
            </View>
            <View style={styles.quantityBadge}>
              <Ionicons name="layers" size={14} color={colors.primary} />
              <Text style={styles.quantityText}>{offer.remainingQuantity} restants</Text>
            </View>
          </View>

          {/* Countdown */}
          {timeLeft > 0 && (
            <View style={styles.countdownCard}>
              <Ionicons name="time-outline" size={20} color={colors.warning} />
              <View style={{ marginLeft: spacing.sm }}>
                <Text style={styles.countdownLabel}>Retrait entre</Text>
                <Text style={styles.countdownTime}>
                  {new Date(offer.pickupStart).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} –{' '}
                  {new Date(offer.pickupEnd).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View style={{ marginLeft: 'auto' as any }}>
                <Text style={styles.timeLeftLabel}>Expire dans</Text>
                <Text style={styles.timeLeftValue}>
                  {hoursLeft > 0 ? `${hoursLeft}h ${minutesLeft}m` : `${minutesLeft}m`}
                </Text>
              </View>
            </View>
          )}

          {/* Address */}
          <View style={styles.addressRow}>
            <Ionicons name="location" size={18} color={colors.primary} />
            <Text style={styles.address}>{offer.merchant.address}, {offer.merchant.city}</Text>
          </View>

          {/* Tags */}
          {offer.tags?.length > 0 && (
            <View style={styles.tagsRow}>
              {offer.tags.map((tag: string) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <View style={styles.reviewsSection}>
              <Text style={styles.sectionTitle}>Avis récents</Text>
              {reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>
                      {review.user.firstName} {review.user.lastName[0]}.
                    </Text>
                    <View style={styles.stars}>
                      {[1,2,3,4,5].map((s) => (
                        <Ionicons key={s} name="star" size={12}
                          color={s <= review.rating ? colors.secondary : colors.border} />
                      ))}
                    </View>
                  </View>
                  {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomPrice}>{offer.currentPrice.toFixed(0)} MAD</Text>
          <Text style={styles.bottomSaving}>
            Économie de {(offer.originalPrice - offer.currentPrice).toFixed(0)} MAD
          </Text>
        </View>
        <Button
          title={offer.remainingQuantity === 0 ? 'Épuisé' : 'Réserver'}
          onPress={handleBook}
          loading={booking}
          disabled={offer.remainingQuantity === 0 || timeLeft <= 0}
          style={styles.bookBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroContainer: { position: 'relative' },
  heroImage: { width: '100%', height: 260 },
  backBtn: {
    position: 'absolute', top: 52, left: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 8,
  },
  shareBtn: {
    position: 'absolute', top: 52, right: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 8,
  },
  discountBadge: {
    position: 'absolute', bottom: spacing.md, left: spacing.lg,
    backgroundColor: colors.error, paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderRadius: borderRadius.round,
  },
  discountText: { color: '#FFF', fontWeight: '900', fontSize: fontSizes.sm },

  content: { padding: spacing.lg },
  merchantRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  merchantLogo: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.borderLight },
  merchantInfo: { flex: 1, marginLeft: spacing.sm },
  merchantName: { fontWeight: '800', fontSize: fontSizes.md, color: colors.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  rating: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.text, marginLeft: 3 },
  reviewCount: { fontSize: fontSizes.xs, color: colors.textSecondary, marginLeft: 2 },
  category: { fontSize: fontSizes.xs, color: colors.textSecondary },

  title: { fontSize: fontSizes.xl, fontWeight: '900', color: colors.text, marginBottom: spacing.sm },
  description: { fontSize: fontSizes.md, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.lg },

  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  currentPrice: { fontSize: fontSizes.xxl, fontWeight: '900', color: colors.primary },
  originalPrice: { fontSize: fontSizes.sm, color: colors.textLight, textDecorationLine: 'line-through' },
  quantityBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primary + '15', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  quantityText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.primary },

  countdownCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.warning + '18', borderRadius: borderRadius.md,
    padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.warning + '40',
  },
  countdownLabel: { fontSize: fontSizes.xs, color: colors.textSecondary },
  countdownTime: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.text },
  timeLeftLabel: { fontSize: fontSizes.xs, color: colors.textSecondary, textAlign: 'right' },
  timeLeftValue: { fontSize: fontSizes.md, fontWeight: '800', color: colors.warning, textAlign: 'right' },

  addressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  address: { fontSize: fontSizes.sm, color: colors.textSecondary, marginLeft: spacing.xs, flex: 1 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.lg },
  tag: { backgroundColor: colors.primary + '15', paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: borderRadius.round },
  tagText: { fontSize: fontSizes.xs, color: colors.primary, fontWeight: '600' },

  reviewsSection: { marginTop: spacing.md },
  sectionTitle: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  reviewCard: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  reviewerName: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.text },
  stars: { flexDirection: 'row', gap: 2 },
  reviewComment: { fontSize: fontSizes.sm, color: colors.textSecondary },

  bottomBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface, padding: spacing.lg,
    borderTopWidth: 1, borderTopColor: colors.border, ...shadows.lg,
  },
  bottomPrice: { fontSize: fontSizes.xl, fontWeight: '900', color: colors.primary },
  bottomSaving: { fontSize: fontSizes.xs, color: colors.success },
  bookBtn: { minWidth: 140 },
});

export default OfferDetailScreen;
