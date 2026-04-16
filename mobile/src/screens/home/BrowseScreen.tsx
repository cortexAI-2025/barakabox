import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator,
  Modal, ScrollView, TextInput, Animated,
} from 'react-native';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { offersAPI } from '../../services/api';
import OfferCard, { Offer } from '../../components/offers/OfferCard';
import { useFavorites } from '../../hooks/useFavorites';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../../utils/theme';

const CATEGORIES = [
  { key: 'all', label: 'Tous', icon: '🌟' },
  { key: 'Restaurant', label: 'Repas', icon: '🍽️' },
  { key: 'Boulangerie', label: 'Boulangerie', icon: '🥐' },
  { key: 'Épicerie', label: 'Épicerie', icon: '🛒' },
  { key: 'Café', label: 'Café', icon: '☕' },
  { key: 'Traiteur', label: 'Traiteur', icon: '🥘' },
];

type ViewMode = 'list' | 'map';

interface FilterState {
  maxDistance: number;
  maxPrice: number;
  sortBy: 'distance' | 'price' | 'rating';
}

const DEFAULT_FILTERS: FilterState = { maxDistance: 10, maxPrice: 200, sortBy: 'distance' };

const MarkerPin: React.FC<{ price: number; selected?: boolean }> = ({ price, selected }) => (
  <View style={[styles.markerPin, selected && styles.markerPinSelected]}>
    <Text style={[styles.markerText, selected && styles.markerTextSelected]}>
      {price.toFixed(0)} MAD
    </Text>
  </View>
);

const BrowseScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { favorites, toggle } = useFavorites();
  const mapRef = useRef<MapView>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filtered, setFiltered] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [pendingFilters, setPendingFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const filterAndSort = useCallback((list: Offer[], cat: string, search: string, f: FilterState) => {
    let out = list;
    if (cat !== 'all') out = out.filter((o) => o.merchant.category === cat);
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter((o) =>
        o.title.toLowerCase().includes(q) ||
        o.merchant.businessName.toLowerCase().includes(q)
      );
    }
    out = out.filter((o) =>
      (o.distance == null || o.distance <= f.maxDistance) &&
      o.currentPrice <= f.maxPrice
    );
    if (f.sortBy === 'distance') out = [...out].sort((a, b) => (a.distance ?? 99) - (b.distance ?? 99));
    else if (f.sortBy === 'price') out = [...out].sort((a, b) => a.currentPrice - b.currentPrice);
    else if (f.sortBy === 'rating') out = [...out].sort((a, b) => b.merchant.rating - a.merchant.rating);
    return out;
  }, []);

  const fetchOffers = useCallback(async (loc?: { lat: number; lon: number }) => {
    const l = loc || location;
    if (!l) return;
    try {
      const res = await offersAPI.getNearby({
        lat: l.lat, lon: l.lon, radius: 20, limit: 50,
      });
      const data: Offer[] = res.data.data || [];
      setOffers(data);
      setFiltered(filterAndSort(data, activeCategory, searchText, filters));
    } catch {}
    finally { setLoading(false); }
  }, [location, activeCategory, searchText, filters, filterAndSort]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLoading(false); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = { lat: loc.coords.latitude, lon: loc.coords.longitude };
      setLocation(coords);
      setRegion({
        latitude: coords.lat, longitude: coords.lon,
        latitudeDelta: 0.08, longitudeDelta: 0.08,
      });
      await fetchOffers(coords);
    })();
  }, []);

  useEffect(() => {
    setFiltered(filterAndSort(offers, activeCategory, searchText, filters));
  }, [activeCategory, searchText, filters, offers, filterAndSort]);

  const applyFilters = () => {
    setFilters(pendingFilters);
    setShowFilters(false);
  };

  const activeFilterCount = [
    filters.maxDistance < 10,
    filters.maxPrice < 200,
    filters.sortBy !== 'distance',
  ].filter(Boolean).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher..."
            placeholderTextColor={colors.textLight}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={16} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => { setPendingFilters(filters); setShowFilters(true); }}>
          <Ionicons name="options-outline" size={20} color={activeFilterCount > 0 ? colors.primary : colors.text} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(i) => i.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.catChip, activeCategory === item.key && styles.catChipActive]}
            onPress={() => setActiveCategory(item.key)}
          >
            <Text style={styles.catIcon}>{item.icon}</Text>
            <Text style={[styles.catText, activeCategory === item.key && styles.catTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* View toggle */}
      <View style={styles.toggleRow}>
        <Text style={styles.resultCount}>{filtered.length} résultats</Text>
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons name="list" size={18} color={viewMode === 'list' ? '#FFF' : colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]}
            onPress={() => setViewMode('map')}
          >
            <Ionicons name="map-outline" size={18} color={viewMode === 'map' ? '#FFF' : colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : viewMode === 'list' ? (
        <FlatList
          data={filtered}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <OfferCard
              offer={item}
              onPress={() => navigation.navigate('OfferDetail', { offerId: item.id })}
              isFavorite={favorites.has(item.id)}
              onToggleFavorite={toggle}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>Aucun résultat</Text>
              <Text style={styles.emptySub}>Essayez d'élargir vos filtres ou votre zone de recherche</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.mapContainer}>
          {region && (
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={region}
              showsUserLocation
              showsMyLocationButton={false}
            >
              {filtered.map((offer) => (
                offer.merchant?.address ? null : (
                  <Marker
                    key={offer.id}
                    coordinate={{
                      latitude: (location?.lat ?? 33.589886) + (Math.random() - 0.5) * 0.05,
                      longitude: (location?.lon ?? -7.603869) + (Math.random() - 0.5) * 0.05,
                    }}
                    onPress={() => setSelectedOffer(offer.id)}
                  >
                    <MarkerPin price={offer.currentPrice} selected={selectedOffer === offer.id} />
                    <Callout onPress={() => navigation.navigate('OfferDetail', { offerId: offer.id })}>
                      <View style={styles.callout}>
                        <Text style={styles.calloutTitle} numberOfLines={1}>{offer.merchant.businessName}</Text>
                        <Text style={styles.calloutPrice}>{offer.currentPrice.toFixed(2)} MAD</Text>
                        <Text style={styles.calloutTap}>Voir l'offre →</Text>
                      </View>
                    </Callout>
                  </Marker>
                )
              ))}
            </MapView>
          )}
          {/* Recenter button */}
          {location && (
            <TouchableOpacity
              style={styles.recenterBtn}
              onPress={() => mapRef.current?.animateToRegion({ latitude: location.lat, longitude: location.lon, latitudeDelta: 0.08, longitudeDelta: 0.08 }, 300)}
            >
              <Ionicons name="navigate" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Filters modal */}
      <Modal visible={showFilters} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtres</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={styles.filterLabel}>Distance max : {pendingFilters.maxDistance} km</Text>
              {[2, 5, 10, 20].map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.filterChip, pendingFilters.maxDistance === d && styles.filterChipActive]}
                  onPress={() => setPendingFilters((p) => ({ ...p, maxDistance: d }))}
                >
                  <Text style={[styles.filterChipText, pendingFilters.maxDistance === d && styles.filterChipTextActive]}>
                    {d} km
                  </Text>
                </TouchableOpacity>
              ))}

              <Text style={[styles.filterLabel, { marginTop: spacing.lg }]}>Prix max : {pendingFilters.maxPrice} MAD</Text>
              {[30, 60, 100, 200].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.filterChip, pendingFilters.maxPrice === p && styles.filterChipActive]}
                  onPress={() => setPendingFilters((f) => ({ ...f, maxPrice: p }))}
                >
                  <Text style={[styles.filterChipText, pendingFilters.maxPrice === p && styles.filterChipTextActive]}>
                    {p} MAD
                  </Text>
                </TouchableOpacity>
              ))}

              <Text style={[styles.filterLabel, { marginTop: spacing.lg }]}>Trier par</Text>
              {[
                { key: 'distance', label: 'Distance' },
                { key: 'price', label: 'Prix' },
                { key: 'rating', label: 'Note' },
              ].map((s) => (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.filterChip, pendingFilters.sortBy === s.key && styles.filterChipActive]}
                  onPress={() => setPendingFilters((f) => ({ ...f, sortBy: s.key as any }))}
                >
                  <Text style={[styles.filterChipText, pendingFilters.sortBy === s.key && styles.filterChipTextActive]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.resetBtn} onPress={() => setPendingFilters(DEFAULT_FILTERS)}>
                <Text style={styles.resetBtnText}>Réinitialiser</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
                <Text style={styles.applyBtnText}>Appliquer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingTop: 56, paddingBottom: spacing.sm, paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.background, borderRadius: borderRadius.round,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
    borderWidth: 1, borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: fontSizes.sm, color: colors.text, padding: 0 },
  filterBtn: { position: 'relative', width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  filterBadge: {
    position: 'absolute', top: 2, right: 2,
    width: 16, height: 16, borderRadius: 8, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  filterBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFF' },

  categories: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.xs },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 1,
    borderRadius: borderRadius.round, backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.border,
  },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catIcon: { fontSize: 14 },
  catText: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textSecondary },
  catTextActive: { color: '#FFF' },

  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
  },
  resultCount: { fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: '600' },
  toggle: { flexDirection: 'row', backgroundColor: colors.borderLight, borderRadius: borderRadius.md, padding: 2 },
  toggleBtn: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.sm },
  toggleBtnActive: { backgroundColor: colors.primary },

  loader: { flex: 1, marginTop: 80 },
  list: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 80 },

  empty: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl },
  emptyIcon: { fontSize: 56, marginBottom: spacing.md },
  emptyTitle: { fontSize: fontSizes.xl, fontWeight: '800', color: colors.text, marginBottom: spacing.xs },
  emptySub: { fontSize: fontSizes.sm, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },

  mapContainer: { flex: 1 },
  map: { flex: 1 },
  recenterBtn: {
    position: 'absolute', right: spacing.lg, bottom: spacing.xl + 20,
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center', ...shadows.md,
  },

  markerPin: {
    backgroundColor: colors.surface, borderRadius: borderRadius.round,
    paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderWidth: 1.5, borderColor: colors.primary,
  },
  markerPinSelected: { backgroundColor: colors.primary },
  markerText: { fontSize: fontSizes.xs, fontWeight: '800', color: colors.primary },
  markerTextSelected: { color: '#FFF' },

  callout: { width: 180, padding: spacing.sm },
  calloutTitle: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.text, marginBottom: 2 },
  calloutPrice: { fontSize: fontSizes.md, fontWeight: '900', color: colors.primary, marginBottom: 4 },
  calloutTap: { fontSize: fontSizes.xs, color: colors.textSecondary },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl, padding: spacing.lg, maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  modalTitle: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.text },

  filterLabel: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  filterChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.round, borderWidth: 1.5, borderColor: colors.border,
    marginBottom: spacing.xs, marginRight: spacing.xs,
    flexDirection: 'row',
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textSecondary },
  filterChipTextActive: { color: '#FFF' },

  modalFooter: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  resetBtn: {
    flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.round,
    borderWidth: 1.5, borderColor: colors.border, alignItems: 'center',
  },
  resetBtnText: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text },
  applyBtn: {
    flex: 2, paddingVertical: spacing.md, borderRadius: borderRadius.round,
    backgroundColor: colors.primary, alignItems: 'center',
  },
  applyBtnText: { fontSize: fontSizes.md, fontWeight: '800', color: '#FFF' },
});

export default BrowseScreen;
