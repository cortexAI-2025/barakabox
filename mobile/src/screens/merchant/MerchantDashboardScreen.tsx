import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { merchantsAPI, ordersAPI } from '../../services/api';
import Button from '../../components/common/Button';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../../utils/theme';

const StatCard: React.FC<{ label: string; value: string | number; icon: string; color: string }> = ({ label, value, icon, color }) => (
  <View style={[styles.statCard, shadows.sm]}>
    <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon as any} size={22} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const MerchantDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        merchantsAPI.getAnalytics(),
        ordersAPI.getMerchantOrders({ limit: 5, status: 'CONFIRMED' }),
      ]);
      setAnalytics(analyticsRes.data.data);
      setRecentOrders(ordersRes.data.data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1, marginTop: 80 }} />;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tableau de bord</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MerchantQRScanner')}>
          <Ionicons name="qr-code-outline" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      {analytics && (
        <View style={styles.statsGrid}>
          <StatCard label="Revenus" value={`${analytics.netRevenue?.toFixed(0)} MAD`} icon="trending-up" color={colors.primary} />
          <StatCard label="Ventes" value={analytics.completedOrders} icon="bag-check" color={colors.success} />
          <StatCard label="Note" value={analytics.rating?.toFixed(1)} icon="star" color={colors.secondary} />
          <StatCard label="Avis" value={analytics.totalReviews} icon="chatbubbles" color={colors.accent} />
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('CreateOffer')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Nouvelle offre</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('MerchantOffers')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.secondary + '20' }]}>
              <Ionicons name="list-outline" size={24} color={colors.secondary} />
            </View>
            <Text style={styles.actionLabel}>Mes offres</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('MerchantOrders')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="receipt-outline" size={24} color={colors.success} />
            </View>
            <Text style={styles.actionLabel}>Commandes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('MerchantQRScanner')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.accent + '20' }]}>
              <Ionicons name="scan-outline" size={24} color={colors.accent} />
            </View>
            <Text style={styles.actionLabel}>Scanner QR</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pending Orders */}
      {recentOrders.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Commandes en attente</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MerchantOrders')}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          {recentOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderCustomer}>
                  {order.user?.firstName} {order.user?.lastName}
                </Text>
                <Text style={styles.orderOffer}>{order.offer?.title}</Text>
                <Text style={styles.orderTime}>
                  {new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View style={styles.orderActions}>
                <Text style={styles.orderPrice}>{order.totalPrice} MAD</Text>
                <Button
                  title="Prêt"
                  onPress={() => ordersAPI.markReady(order.id).then(fetchData)}
                  size="sm"
                  style={{ marginTop: spacing.xs }}
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 56, paddingBottom: spacing.md, paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: fontSizes.xl, fontWeight: '900', color: colors.text },

  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', padding: spacing.lg, gap: spacing.sm,
  },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: colors.surface,
    borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center',
  },
  statIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  statValue: { fontSize: fontSizes.xl, fontWeight: '900', color: colors.text },
  statLabel: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },

  section: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  seeAll: { color: colors.primary, fontWeight: '700', fontSize: fontSizes.sm },

  actionsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { alignItems: 'center', flex: 1 },
  actionIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  actionLabel: { fontSize: fontSizes.xs, color: colors.text, fontWeight: '600', textAlign: 'center' },

  orderCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: borderRadius.md,
    padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm,
  },
  orderInfo: { flex: 1 },
  orderCustomer: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.text },
  orderOffer: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  orderTime: { fontSize: fontSizes.xs, color: colors.textLight, marginTop: 2 },
  orderActions: { alignItems: 'flex-end' },
  orderPrice: { fontSize: fontSizes.md, fontWeight: '800', color: colors.primary },
});

export default MerchantDashboardScreen;
