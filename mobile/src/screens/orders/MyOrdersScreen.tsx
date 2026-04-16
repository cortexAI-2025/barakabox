import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ordersAPI } from '../../services/api';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../../utils/theme';

const STATUS_TABS = [
  { key: 'all', label: 'Tout' },
  { key: 'CONFIRMED', label: 'Confirmé' },
  { key: 'READY', label: 'Prêt' },
  { key: 'COMPLETED', label: 'Terminé' },
  { key: 'CANCELLED', label: 'Annulé' },
];

const STATUS_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  PENDING: { color: colors.warning, icon: 'time-outline', label: 'En attente' },
  CONFIRMED: { color: colors.primary, icon: 'checkmark-circle-outline', label: 'Confirmé' },
  READY: { color: colors.secondary, icon: 'bag-check-outline', label: 'Prêt' },
  COMPLETED: { color: colors.success, icon: 'checkmark-done-circle-outline', label: 'Terminé' },
  CANCELLED: { color: colors.error, icon: 'close-circle-outline', label: 'Annulé' },
  NO_SHOW: { color: colors.textSecondary, icon: 'alert-circle-outline', label: 'Absent' },
};

const MyOrdersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const fetchOrders = async () => {
    try {
      const params = activeTab !== 'all' ? { status: activeTab } : {};
      const res = await ordersAPI.getUserOrders(params);
      setOrders(res.data.data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [activeTab]);

  const renderOrder = ({ item }: { item: any }) => {
    const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderTitleRow}>
            <Text style={styles.orderTitle}>{item.offer?.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: config.color + '20' }]}>
              <Ionicons name={config.icon as any} size={12} color={config.color} />
              <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
            </View>
          </View>
          <Text style={styles.merchantName}>{item.merchant?.businessName}</Text>
        </View>

        <View style={styles.orderFooter}>
          <View style={styles.footerLeft}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString('fr-FR')}
            </Text>
          </View>
          <Text style={styles.price}>{item.totalPrice} MAD</Text>
        </View>

        {(item.status === 'CONFIRMED' || item.status === 'READY') && (
          <View style={[styles.qrHint, { backgroundColor: config.color + '15' }]}>
            <Ionicons name="qr-code-outline" size={14} color={config.color} />
            <Text style={[styles.qrHintText, { color: config.color }]}>
              Appuyez pour voir le QR code
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes commandes</Text>
      </View>

      {/* Tabs */}
      <FlatList
        horizontal
        data={STATUS_TABS}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.tab, activeTab === item.key && styles.tabActive]}
            onPress={() => setActiveTab(item.key)}
          >
            <Text style={[styles.tabText, activeTab === item.key && styles.tabTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>Aucune commande</Text>
              <Text style={styles.emptySubtext}>Vos réservations apparaîtront ici</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingTop: 56, paddingBottom: spacing.md, paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: fontSizes.xl, fontWeight: '900', color: colors.text },
  tabs: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  tab: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: borderRadius.round, backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.border, marginRight: spacing.sm,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: '#FFF' },
  loader: { flex: 1, marginTop: 60 },
  list: { padding: spacing.lg },
  orderCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.md, marginBottom: spacing.md, ...shadows.sm,
  },
  orderHeader: { marginBottom: spacing.sm },
  orderTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  orderTitle: { flex: 1, fontSize: fontSizes.md, fontWeight: '700', color: colors.text },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: spacing.xs, paddingVertical: 2, borderRadius: borderRadius.round,
  },
  statusText: { fontSize: 10, fontWeight: '700' },
  merchantName: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: fontSizes.sm, color: colors.textSecondary },
  price: { fontSize: fontSizes.md, fontWeight: '800', color: colors.primary },
  qrHint: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: spacing.sm, padding: spacing.xs, borderRadius: borderRadius.sm,
  },
  qrHintText: { fontSize: fontSizes.xs, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 56, marginBottom: spacing.md },
  emptyText: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },
  emptySubtext: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: spacing.xs },
});

export default MyOrdersScreen;
