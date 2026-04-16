import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../../utils/theme';

const OrderConfirmationScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { order } = route.params;

  const orderRef = order.id.slice(-6).toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark-circle" size={80} color={colors.success} />
      </View>

      <Text style={styles.title}>Réservation confirmée!</Text>
      <Text style={styles.subtitle}>
        Votre Baraka Box est réservée. Présentez le QR code lors du retrait.
      </Text>

      {/* Order Ref */}
      <View style={styles.refCard}>
        <Text style={styles.refLabel}>Référence commande</Text>
        <Text style={styles.refValue}>#{orderRef}</Text>
      </View>

      {/* QR Code */}
      {order.qrCodeImage && (
        <View style={styles.qrCard}>
          <Text style={styles.qrLabel}>Votre QR Code de retrait</Text>
          <Image source={{ uri: order.qrCodeImage }} style={styles.qrCode} />
          <Text style={styles.qrHint}>Montrez ce code au marchand pour récupérer votre commande</Text>
        </View>
      )}

      {/* Details */}
      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Ionicons name="storefront-outline" size={18} color={colors.primary} />
          <Text style={styles.detailLabel}>Marchand</Text>
          <Text style={styles.detailValue}>{order.merchant?.businessName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={18} color={colors.primary} />
          <Text style={styles.detailLabel}>Adresse</Text>
          <Text style={styles.detailValue}>{order.merchant?.address}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={18} color={colors.primary} />
          <Text style={styles.detailLabel}>Retrait</Text>
          <Text style={styles.detailValue}>
            {new Date(order.offer?.pickupStart).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} –{' '}
            {new Date(order.offer?.pickupEnd).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={18} color={colors.primary} />
          <Text style={styles.detailLabel}>Total</Text>
          <Text style={[styles.detailValue, { color: colors.primary, fontWeight: '800' }]}>
            {order.totalPrice} MAD
          </Text>
        </View>
      </View>

      <View style={styles.ecoCard}>
        <Text style={styles.ecoIcon}>🌱</Text>
        <Text style={styles.ecoText}>
          Merci! En sauvant cette nourriture, vous aidez à réduire le gaspillage alimentaire.
        </Text>
      </View>

      <Button
        title="Voir mes commandes"
        onPress={() => navigation.navigate('Orders')}
        fullWidth
        size="lg"
        style={{ marginBottom: spacing.md }}
      />
      <Button
        title="Retour à l'accueil"
        onPress={() => navigation.navigate('Home')}
        variant="outline"
        fullWidth
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: 60, alignItems: 'center' },
  successIcon: { marginBottom: spacing.lg },
  title: { fontSize: fontSizes.xxl, fontWeight: '900', color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { fontSize: fontSizes.md, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl },

  refCard: {
    backgroundColor: colors.primary + '15', borderRadius: borderRadius.md, padding: spacing.md,
    alignItems: 'center', width: '100%', marginBottom: spacing.lg,
  },
  refLabel: { fontSize: fontSizes.sm, color: colors.textSecondary, marginBottom: 4 },
  refValue: { fontSize: fontSizes.xxl, fontWeight: '900', color: colors.primary, letterSpacing: 3 },

  qrCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg,
    alignItems: 'center', width: '100%', marginBottom: spacing.lg, ...shadows.md,
  },
  qrLabel: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  qrCode: { width: 200, height: 200, borderRadius: borderRadius.sm },
  qrHint: { fontSize: fontSizes.xs, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },

  detailsCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg,
    width: '100%', marginBottom: spacing.lg, ...shadows.sm,
  },
  detailRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm,
    paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  detailLabel: { flex: 1, fontSize: fontSizes.sm, color: colors.textSecondary },
  detailValue: { flex: 2, fontSize: fontSizes.sm, color: colors.text, fontWeight: '600', textAlign: 'right' },

  ecoCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.success + '15', borderRadius: borderRadius.md,
    padding: spacing.md, marginBottom: spacing.xl, width: '100%',
  },
  ecoIcon: { fontSize: 24 },
  ecoText: { flex: 1, fontSize: fontSizes.sm, color: colors.success, fontWeight: '600', lineHeight: 18 },
});

export default OrderConfirmationScreen;
