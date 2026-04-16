import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
  TouchableOpacity, FlatList, ActivityIndicator, Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import { offersAPI } from '../../services/api';
import OfferCard, { Offer } from '../../components/offers/OfferCard';
import { useFavorites } from '../../hooks/useFavorites';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../../utils/theme';
import { useAppSelector } from '../../store';

const CATEGORIES = [
  { key: 'all', label: 'Tous', icon: '🌟' },
  { key: 'Restaurant', label: 'Repas', icon: '🍽️' },
  { key: 'Boulangerie', label: 'Boulangerie & pâtisserie', icon: '🥐' },
  { key: 'Épicerie', label: 'Épicerie', icon: '🛒' },
  { key: 'Café', label: 'Café', icon: '☕' },
  { key: 'Traiteur', label: 'Traiteur', icon: '🥘' },
];

const AntiBannerCard: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity style={styles.antiBanner} onPress={onPress} activeOpacity={0.9}>
    <View style={styles.antiBannerText}>
      <Text style={styles.antiBannerTitle}>Colis anti{'\n'}gaspi</Text>
      <Text style={styles.antiBannerSub}>
        Des invendus alimentaires de qualité provenant de marchands locaux.
      </Text>
      <View style={styles.antiBannerBtn}>
        <Text style={styles.antiBannerBtnText}>Découvrir</Text>
      </View>
    </View>
    <View style={styles.antiBannerBox}>
      <Text style={styles.antiBannerBoxIcon}>📦</Text>
    </View>
  </TouchableOpacity>
);

const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user } = useAppSelector((s) => s.auth);
  const { favorites, toggle } = useFavorites();
  const scrollY = useRef(new Animated.Value(0)).current;

  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [cityName, setCityName] = useState<string>('Votre position');
  const [todayOffers, setTodayOffers] = useState<Offer[]>([]);
  const [tomorrowOffers, setTomorrowOffers] = useState<Offer[]>([]);
  const [recommended, setRecommended] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const headerBg = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: ['rgba(255,255,255,0)', 'rgba(255,255,255,1)'],
    extrapolate: 'clamp',
  });

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    // Reverse geocode for city name
    const [place] = await Location.reverseGeocodeAsync({
      latitude: loc.coords.latitude, longitude: loc.coords.longitude,
    });
    if (place?.city) setCityName(place.city);
    return { lat: loc.coords.latitude, lon: loc.coords.longitude };
  };

  const fetchOffers = useCallback(async (coords?: { lat: number; lon: number }) => {
    const loc = coords || location;
    if (!loc) return;
    try {
      const params = {
        lat: loc.lat, lon: loc.lon, radius: 10,
        ...(activeCategory !== 'all' && { category: activeCategory }),
      };
      const [nearbyRes, recRes] = await Promise.all([
        offersAPI.getNearby({ ...params, limit: 20 }),
        offersAPI.getRecommended(params),
      ]);
      const all: Offer[] = nearbyRes.data.data || [];
      const now = new Date();
      const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59);
      const tomorrowStart = new Date(now); tomorrowStart.setDate(tomorrowStart.getDate() + 1); tomorrowStart.setHours(0, 0, 0);
      const tomorrowEnd = new Date(tomorrowStart); tomorrowEnd.setHours(23, 59, 59);

      setTodayOffers(all.filter((o) => new Date(o.pickupEnd) <= todayEnd));
      setTomorrowOffers(all.filter((o) => {
        const end = new Date(o.pickupEnd);
        return end >= tomorrowStart && end <= tomorrowEnd;
      }));
      setRecommended(recRes.data.data || []);
    } catch { /* silent */ }
  }, [location, activeCategory]);

  useEffect(() => {
    (async () => {
      const loc = await requestLocation();
      if (loc) { setLocation(loc); await fetchOffers(loc); }
      setLoading(false);
    })();
  }, []);

  useEffect(() => { if (location) fetchOffers(); }, [activeCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOffers();
    setRefreshing(false);
  };

  if (loading) return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loaderText}>Recherche des offres...</Text>
    </View>
  );

  return (
    <View style={styles.root}>
      {/* Animated header */}
      <Animated.View style={[styles.stickyHeader, { backgroundColor: headerBg }]}>
        <TouchableOpacity
          style={styles.locationPill}
          onPress={() => navigation.navigate('Browse')}
        >
          <View style={styles.locationIcon}>
            <Ionicons name="navigate" size={14} color="#FFF" />
          </View>
          <Text style={styles.locationLabel}>Position actuelle</Text>
          <Text style={styles.locationCity}>{cityName}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.text} style={{ marginLeft: 2 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={styles.scroll}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Top spacer for header */}
        <View style={{ height: 80 }} />

        {/* Category chips */}
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.catChip, activeCategory === item.key && styles.catChipActive]}
              onPress={() => setActiveCategory(item.key)}
            >
              <Text style={[styles.catText, activeCategory === item.key && styles.catTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Today's offers */}
        {todayOffers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Paniers Surprise dans votre région</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Browse')}>
                <Text style={styles.seeAll}>Tout voir</Text>
              </TouchableOpacity>
            </View>
            {todayOffers.slice(0, 5).map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onPress={() => navigation.navigate('OfferDetail', { offerId: offer.id })}
                isFavorite={favorites.has(offer.id)}
                onToggleFavorite={toggle}
                variant="list"
              />
            ))}
          </View>
        )}

        {/* Anti-gaspi banner */}
        <View style={styles.bannerSection}>
          <AntiBannerCard onPress={() => navigation.navigate('Browse')} />
        </View>

        {/* Tomorrow's offers */}
        {tomorrowOffers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pour demain</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Browse')}>
                <Text style={styles.seeAll}>Tout voir</Text>
              </TouchableOpacity>
            </View>
            {tomorrowOffers.slice(0, 3).map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onPress={() => navigation.navigate('OfferDetail', { offerId: offer.id })}
                isFavorite={favorites.has(offer.id)}
                onToggleFavorite={toggle}
              />
            ))}
          </View>
        )}

        {/* Recommended */}
        {recommended.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recommandés pour vous</Text>
            </View>
            {recommended.slice(0, 3).map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onPress={() => navigation.navigate('OfferDetail', { offerId: offer.id })}
                isFavorite={favorites.has(offer.id)}
                onToggleFavorite={toggle}
              />
            ))}
          </View>
        )}

        {todayOffers.length === 0 && tomorrowOffers.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyTitle}>Aucune offre disponible</Text>
            <Text style={styles.emptySub}>Revenez plus tard ou élargissez votre zone de recherche</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loaderText: { marginTop: spacing.md, color: colors.textSecondary },

  stickyHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: 48, paddingBottom: spacing.sm,
  },
  locationPill: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  locationIcon: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  locationLabel: { fontSize: fontSizes.xs, color: colors.textSecondary, fontWeight: '500' },
  locationCity: { fontSize: fontSizes.md, fontWeight: '800', color: colors.text },
  notifBtn: { padding: spacing.xs },

  scroll: { paddingHorizontal: 0 },

  categories: {
    paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.xs,
  },
  catChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border,
  },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catText: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textSecondary },
  catTextActive: { color: '#FFF' },

  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.text, flex: 1 },
  seeAll: { fontSize: fontSizes.sm, color: colors.primary, fontWeight: '700', textDecorationLine: 'underline' },

  bannerSection: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  antiBanner: {
    backgroundColor: colors.primary, borderRadius: borderRadius.xl,
    flexDirection: 'row', overflow: 'hidden', padding: spacing.lg,
    minHeight: 160,
  },
  antiBannerText: { flex: 1, justifyContent: 'space-between' },
  antiBannerTitle: {
    fontSize: 26, fontWeight: '900', color: colors.secondary,
    lineHeight: 30, fontStyle: 'italic',
  },
  antiBannerSub: {
    fontSize: fontSizes.xs, color: 'rgba(255,255,255,0.85)',
    lineHeight: 16, marginVertical: spacing.sm,
  },
  antiBannerBtn: {
    alignSelf: 'flex-start', backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.round,
  },
  antiBannerBtnText: { fontSize: fontSizes.sm, fontWeight: '800', color: colors.primary },
  antiBannerBox: {
    width: 110, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: spacing.sm,
  },
  antiBannerBoxIcon: { fontSize: 72 },

  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl },
  emptyIcon: { fontSize: 56, marginBottom: spacing.md },
  emptyTitle: { fontSize: fontSizes.xl, fontWeight: '800', color: colors.text, marginBottom: spacing.xs },
  emptySub: { fontSize: fontSizes.sm, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});

export default HomeScreen;
