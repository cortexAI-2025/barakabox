import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
  TextInput, TouchableOpacity, FlatList, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import { offersAPI } from '../../services/api';
import OfferCard from '../../components/offers/OfferCard';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../../utils/theme';
import { useAppSelector } from '../../store';

const CATEGORIES = ['Tout', 'Boulangerie', 'Restaurant', 'Café', 'Épicerie', 'Pâtisserie', 'Traiteur'];

const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user } = useAppSelector((s) => s.auth);

  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [nearbyOffers, setNearbyOffers] = useState<any[]>([]);
  const [recommendedOffers, setRecommendedOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tout');
  const [searchQuery, setSearchQuery] = useState('');

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { lat: loc.coords.latitude, lon: loc.coords.longitude };
  };

  const fetchOffers = useCallback(async (loc?: { lat: number; lon: number }) => {
    const coords = loc || location;
    if (!coords) return;

    try {
      const params = {
        lat: coords.lat, lon: coords.lon, radius: 10,
        ...(selectedCategory !== 'Tout' && { category: selectedCategory }),
      };
      const [nearby, recommended] = await Promise.all([
        offersAPI.getNearby(params),
        offersAPI.getRecommended(params),
      ]);
      setNearbyOffers(nearby.data.data || []);
      setRecommendedOffers(recommended.data.data || []);
    } catch (e) {
      // silently fail — show empty state
    }
  }, [location, selectedCategory]);

  useEffect(() => {
    (async () => {
      const loc = await requestLocation();
      if (loc) {
        setLocation(loc);
        await fetchOffers(loc);
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (location) fetchOffers();
  }, [selectedCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOffers();
    setRefreshing(false);
  };

  const filteredNearby = nearbyOffers.filter(
    (o) => !searchQuery || o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.merchant.businessName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Recherche des offres...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Bonjour{user ? `, ${user.firstName}` : ''} 👋
          </Text>
          <Text style={styles.subtitle}>Sauvez de la nourriture aujourd'hui</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('home.searchPlaceholder')}
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={() => navigation.navigate('Map')} style={styles.mapBtn}>
          <Ionicons name="map-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Recommended */}
      {recommendedOffers.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.recommended')}</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recommendedOffers.slice(0, 5)}
            horizontal
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <OfferCard offer={item} onPress={() => navigation.navigate('OfferDetail', { offerId: item.id })} />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: spacing.lg }}
          />
        </View>
      )}

      {/* Nearby Offers */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.nearby')}</Text>
          <Text style={styles.count}>{filteredNearby.length} offres</Text>
        </View>
        {filteredNearby.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyText}>{t('home.noOffers')}</Text>
          </View>
        ) : (
          filteredNearby.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onPress={() => navigation.navigate('OfferDetail', { offerId: offer.id })}
              horizontal
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: spacing.md, color: colors.textSecondary },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md,
    backgroundColor: colors.surface, ...shadows.sm,
  },
  greeting: { fontSize: fontSizes.xl, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: fontSizes.sm, color: colors.textSecondary },
  notifBtn: { padding: spacing.xs },

  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, margin: spacing.lg,
    borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, ...shadows.sm,
  },
  searchIcon: { marginRight: spacing.xs },
  searchInput: { flex: 1, height: 48, fontSize: fontSizes.md, color: colors.text },
  mapBtn: { padding: spacing.xs },

  categories: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  categoryChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: borderRadius.round, borderWidth: 1.5, borderColor: colors.border,
    marginRight: spacing.sm, backgroundColor: colors.surface,
  },
  categoryChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryText: { fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: '600' },
  categoryTextActive: { color: '#FFF' },

  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.text },
  count: { fontSize: fontSizes.sm, color: colors.textSecondary },
  seeAll: { fontSize: fontSizes.sm, color: colors.primary, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { fontSize: fontSizes.md, color: colors.textSecondary, textAlign: 'center' },
});

export default HomeScreen;
