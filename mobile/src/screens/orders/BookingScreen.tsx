import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ordersAPI } from '../../services/api';
import Button from '../../components/common/Button';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../../utils/theme';

const PAYMENT_METHODS = [
  { id: 'CASH', label: 'Espèces à la livraison', icon: 'cash-outline', desc: 'Payez lors du retrait' },
  { id: 'WALLET', label: 'Portefeuille BarakaBox', icon: 'wallet-outline', desc: 'Solde disponible: 0 MAD', disabled: true },
  { id: 'CARD', label: 'Carte bancaire', icon: 'card-outline', desc: 'Bientôt disponible', disabled: true },
];

const BookingScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { offer } = route.params;

  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const totalPrice = offer.currentPrice * quantity;

  const handleBook = async () => {
    setLoading(true);
    try {
      const res = await ordersAPI.create({ offerId: offer.id, quantity, paymentMethod });
      const order = res.data.data;
      navigation.replace('OrderConfirmation', { order });
    } catch (e: any) {
      Alert.alert('Erreur', e.response?.data?.message || 'Réservation impossible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Finaliser la réservation</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Offer Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offre sélectionnée</Text>
          <View style={styles.offerCard}>
            <Text style={styles.offerTitle}>{offer.title}</Text>
            <Text style={styles.merchantName}>{offer.merchant.businessName}</Text>
            <View style={styles.pickupRow}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.pickupText}>
                Retrait {new Date(offer.pickupStart).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} –{' '}
                {new Date(offer.pickupEnd).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        </View>

        {/* Quantity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantité</Text>
          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Ionicons name="remove" size={20} color={quantity <= 1 ? colors.textLight : colors.primary} />
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <TouchableOpacity
              style={[styles.qtyBtn, quantity >= Math.min(5, offer.remainingQuantity) && styles.qtyBtnDisabled]}
              onPress={() => setQuantity((q) => Math.min(5, offer.remainingQuantity, q + 1))}
            >
              <Ionicons name="add" size={20} color={quantity >= Math.min(5, offer.remainingQuantity) ? colors.textLight : colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mode de paiement</Text>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentOption,
                paymentMethod === method.id && styles.paymentOptionActive,
                method.disabled && styles.paymentOptionDisabled,
              ]}
              onPress={() => !method.disabled && setPaymentMethod(method.id)}
              disabled={method.disabled}
            >
              <Ionicons
                name={method.icon as any}
                size={22}
                color={paymentMethod === method.id ? colors.primary : colors.textSecondary}
              />
              <View style={styles.paymentInfo}>
                <Text style={[styles.paymentLabel, method.disabled && { color: colors.textLight }]}>
                  {method.label}
                </Text>
                <Text style={styles.paymentDesc}>{method.desc}</Text>
              </View>
              {!method.disabled && (
                <View style={[styles.radio, paymentMethod === method.id && styles.radioActive]}>
                  {paymentMethod === method.id && <View style={styles.radioDot} />}
                </View>
              )}
              {method.disabled && (
                <View style={styles.comingSoon}>
                  <Text style={styles.comingSoonText}>Bientôt</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Price Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Récapitulatif</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Prix unitaire</Text>
              <Text style={styles.summaryValue}>{offer.currentPrice.toFixed(0)} MAD</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Quantité</Text>
              <Text style={styles.summaryValue}>× {quantity}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{totalPrice.toFixed(0)} MAD</Text>
            </View>
            <View style={styles.savingRow}>
              <Ionicons name="leaf" size={14} color={colors.success} />
              <Text style={styles.savingText}>
                Vous économisez {((offer.originalPrice - offer.currentPrice) * quantity).toFixed(0)} MAD
                et évitez le gaspillage!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.bottomBar}>
        <Button
          title={`Confirmer · ${totalPrice.toFixed(0)} MAD`}
          onPress={handleBook}
          loading={loading}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.md,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.text },

  section: { padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  sectionTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text, marginBottom: spacing.md },

  offerCard: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, ...shadows.sm },
  offerTitle: { fontSize: fontSizes.md, fontWeight: '800', color: colors.text },
  merchantName: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.xs },
  pickupRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pickupText: { fontSize: fontSizes.sm, color: colors.textSecondary },

  quantityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xl },
  qtyBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnDisabled: { backgroundColor: colors.borderLight },
  qtyValue: { fontSize: fontSizes.xxl, fontWeight: '900', color: colors.text, minWidth: 40, textAlign: 'center' },

  paymentOption: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderRadius: borderRadius.md,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 2, borderColor: 'transparent', ...shadows.sm,
  },
  paymentOptionActive: { borderColor: colors.primary, backgroundColor: colors.primary + '08' },
  paymentOptionDisabled: { opacity: 0.5 },
  paymentInfo: { flex: 1 },
  paymentLabel: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.text },
  paymentDesc: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  comingSoon: { backgroundColor: colors.textLight + '30', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  comingSoonText: { fontSize: 10, color: colors.textSecondary, fontWeight: '600' },

  summaryCard: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, ...shadows.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  summaryLabel: { fontSize: fontSizes.sm, color: colors.textSecondary },
  summaryValue: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  totalLabel: { fontSize: fontSizes.md, fontWeight: '800', color: colors.text },
  totalValue: { fontSize: fontSizes.xl, fontWeight: '900', color: colors.primary },
  savingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm, backgroundColor: colors.success + '15', borderRadius: borderRadius.sm, padding: spacing.xs },
  savingText: { fontSize: fontSizes.xs, color: colors.success, flex: 1, fontWeight: '600' },

  bottomBar: {
    backgroundColor: colors.surface, padding: spacing.lg,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
});

export default BookingScreen;
