import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ordersAPI } from '../../services/api';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../../utils/theme';

const STATUS_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  PENDING:   { color: colors.warning,       icon: 'time-outline',                  label: 'En attente' },
  CONFIRMED: { color: colors.primary,       icon: 'checkmark-circle-outline',      label: 'Confirmé' },
  READY:     { color: colors.secondary,     icon: 'bag-check-outline',             label: 'Prêt à récupérer' },
  COMPLETED: { color: colors.success,       icon: 'checkmark-done-circle-outline', label: 'Récupéré' },
  CANCELLED: { color: colors.error,         icon: 'close-circle-outline',          label: 'Annulé' },
  NO_SHOW:   { color: colors.textSecondary, icon: 'alert-circle-outline',          label: 'Absent' },
};

const InfoRow: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon as any} size={18} color={colors.textSecondary} />
    <View style={styles.infoText}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const OrderDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.getById(orderId)
      .then((res) => setOrder(res.data.data))
      .catch(() => Alert.alert('Erreur', 'Impossible de charger la commande'))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleCancel = () => {
    Alert.alert('Annuler la commande', 'Êtes-vous sûr de vouloir annuler cette commande ?', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui, annuler', style: 'destructive',
        onPress: () => {
          ordersAPI.cancel(orderId)
            .then(() => { setOrder((o: any) => ({ ...o, status: 'CANCELLED' })); })
            .catch(() => Alert.alert('Erreur', 'Annulation impossible'));
        },
      },
    ]);
  };

  if (loading) return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );

  if (!order) return null;

  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const pickupStart = new Date(order.offer?.pickupStart).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const pickupEnd   = new Date(order.offer?.pickupEnd).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const pickupDate  = new Date(order.offer?.pickupStart).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const canCancel   = ['PENDING', 'CONFIRMED'].includes(order.status);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Commande</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Status banner */}
        <View style={[styles.statusBanner, { backgroundColor: config.color + '15', borderColor: config.color + '30' }]}>
          <Ionicons name={config.icon as any} size={28} color={config.color} />
          <View style={styles.statusText}>
            <Text style={[styles.statusLabel, { color: config.color }]}>{config.label}</Text>
            <Text style={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</Text>
          </View>
        </View>

        {/* Offer info */}
        <View style={[styles.card, shadows.sm]}>
          <Text style={styles.cardTitle}>Détails du panier</Text>
          <Text style={styles.offerTitle}>{order.offer?.title}</Text>
          <Text style={styles.merchantName}>{order.merchant?.businessName}</Text>

          <View style={styles.divider} />

          <InfoRow icon="calendar-outline"  label="Date de retrait" value={pickupDate} />
          <InfoRow icon="time-outline"      label="Créneau"         value={`${pickupStart} – ${pickupEnd}`} />
          <InfoRow icon="location-outline"  label="Adresse"         value={order.merchant?.address || '—'} />
          <InfoRow icon="cube-outline"      label="Quantité"        value={`${order.quantity} panier${order.quantity > 1 ? 's' : ''}`} />
        </View>

        {/* QR Code */}
        {['CONFIRMED', 'READY'].includes(order.status) && (
          <View style={[styles.card, styles.qrCard, shadows.sm]}>
            <Ionicons name="qr-code-outline" size={64} color={colors.primary} />
            <Text style={styles.qrCode}>{order.qrCode}</Text>
            <Text style={styles.qrHint}>Présentez ce code au marchand lors du retrait</Text>
          </View>
        )}

        {/* Payment */}
        <View style={[styles.card, shadows.sm]}>
          <Text style={styles.cardTitle}>Paiement</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Prix unitaire</Text>
            <Text style={styles.priceValue}>{order.unitPrice?.toFixed(2)} MAD</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Quantité</Text>
            <Text style={styles.priceValue}>× {order.quantity}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{order.totalPrice?.toFixed(2)} MAD</Text>
          </View>
        </View>

        {/* Cancel button */}
        {canCancel && (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelText}>Annuler la commande</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: spacing.md, paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.text },

  scroll: { padding: spacing.lg },

  statusBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    borderRadius: borderRadius.lg, borderWidth: 1,
    padding: spacing.lg, marginBottom: spacing.md,
  },
  statusText: { flex: 1 },
  statusLabel: { fontSize: fontSizes.lg, fontWeight: '800' },
  orderId: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },

  card: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  cardTitle: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textSecondary, marginBottom: spacing.md, textTransform: 'uppercase', letterSpacing: 0.8 },
  offerTitle: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.text, marginBottom: 4 },
  merchantName: { fontSize: fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.sm },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.sm },

  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  infoText: { flex: 1 },
  infoLabel: { fontSize: fontSizes.xs, color: colors.textSecondary },
  infoValue: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.text },

  qrCard: { alignItems: 'center', paddingVertical: spacing.xl },
  qrCode: { fontSize: fontSizes.xl, fontWeight: '900', color: colors.primary, letterSpacing: 3, marginTop: spacing.md },
  qrHint: { fontSize: fontSizes.xs, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },

  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  priceLabel: { fontSize: fontSizes.sm, color: colors.textSecondary },
  priceValue: { fontSize: fontSizes.sm, color: colors.text },
  totalLabel: { fontSize: fontSizes.md, fontWeight: '800', color: colors.text },
  totalValue: { fontSize: fontSizes.lg, fontWeight: '900', color: colors.primary },

  cancelBtn: {
    borderWidth: 1.5, borderColor: colors.error,
    borderRadius: borderRadius.round, paddingVertical: spacing.md,
    alignItems: 'center', marginTop: spacing.sm,
  },
  cancelText: { fontSize: fontSizes.md, fontWeight: '700', color: colors.error },
});

export default OrderDetailScreen;
