import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../../store';
import { ordersAPI } from '../../services/api';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../../utils/theme';

const ImpactCard: React.FC<{
  title: string; value: string; unit: string; icon: string;
}> = ({ title, value, unit, icon }) => (
  <View style={styles.impactCard}>
    <Text style={styles.impactTitle}>{title}</Text>
    <Text style={styles.impactIcon}>{icon}</Text>
    <Text style={styles.impactValue}>{value}</Text>
    <Text style={styles.impactUnit}>{unit}</Text>
  </View>
);

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAppSelector((s) => s.auth);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [stats, setStats] = useState({ totalSaved: 0, co2: 0, orders: 0 });

  useEffect(() => {
    if (!user) return;
    ordersAPI.getUserOrders({ status: 'COMPLETED', limit: 1 }).then((res) => {
      const orders = res.data.data || [];
      if (orders.length) setLastOrder(orders[0]);
    }).catch(() => {});

    ordersAPI.getUserOrders({ status: 'COMPLETED', limit: 100 }).then((res) => {
      const orders = res.data.data || [];
      const totalSaved = orders.reduce((sum: number, o: any) =>
        sum + (o.offer?.originalPrice - o.unitPrice) * o.quantity, 0);
      // ~2.5kg CO2 per meal saved, ~0.4 kWh equivalent
      setStats({
        orders: orders.length,
        totalSaved: Math.round(totalSaved),
        co2: Math.round(orders.length * 0.4 * 100) / 10,
      });
    }).catch(() => {});
  }, [user]);

  if (!user) {
    return (
      <View style={styles.guestContainer}>
        <Text style={styles.guestIcon}>👤</Text>
        <Text style={styles.guestTitle}>Pas encore connecté</Text>
        <Text style={styles.guestSub}>Connectez-vous pour voir votre profil et votre impact</Text>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginBtnText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header: avatar + name + settings */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.nameBlock}>
            <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
            <Text style={styles.userEmail}>{user.email || user.phone}</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => navigation.navigate('Account')}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Last order */}
      {lastOrder && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vos commandes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.orderCard}
            onPress={() => navigation.navigate('Orders')}
          >
            <View style={styles.orderLogoWrap}>
              <Image
                source={{ uri: lastOrder.merchant?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(lastOrder.merchant?.businessName || 'B')}&background=1A5C35&color=fff` }}
                style={styles.orderLogo}
              />
              {lastOrder.status === 'COMPLETED' && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={10} color="#FFF" />
                </View>
              )}
            </View>
            <View style={styles.orderInfo}>
              <Text style={styles.orderMerchant}>{lastOrder.merchant?.businessName}</Text>
              <View style={styles.starsRow}>
                {lastOrder.review ? (
                  [1, 2, 3, 4, 5].map((s) => (
                    <Ionicons
                      key={s} name="star" size={16}
                      color={s <= lastOrder.review.rating ? colors.secondary : colors.border}
                    />
                  ))
                ) : (
                  <TouchableOpacity
                    style={styles.reviewBtn}
                    onPress={() => navigation.navigate('Orders')}
                  >
                    <Text style={styles.reviewBtnText}>Laisser un avis →</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Referral card */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.referralCard} onPress={() => navigation.navigate('Account')}>
          <View style={styles.referralImgWrap}>
            <Text style={styles.referralImgPlaceholder}>🤝</Text>
          </View>
          <View style={styles.referralContent}>
            <Text style={styles.referralTitle}>Invitez vos amis</Text>
            <Text style={styles.referralSub}>
              Gagnez un bon pour chaque ami qui rejoint l'application et sauve des repas !
            </Text>
            <View style={styles.referralCTA}>
              <Ionicons name="ticket-outline" size={14} color={colors.primary} />
              <Text style={styles.referralCTAText}>Gagnez des bons de 25 MAD</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Impact stats */}
      <View style={styles.section}>
        <View style={styles.impactRow}>
          <ImpactCard
            title={`CO2e\névité`}
            value={`${stats.co2}`}
            unit="kWh"
            icon="⚡"
          />
          <View style={styles.impactDivider} />
          <ImpactCard
            title={`Économies\nréalisées`}
            value={`${stats.totalSaved}`}
            unit="MAD"
            icon="🪙"
          />
        </View>
      </View>

      {/* App version */}
      <Text style={styles.version}>BarakaBox v1.0.0</Text>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  guestContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: spacing.xl, backgroundColor: colors.background,
  },
  guestIcon: { fontSize: 64, marginBottom: spacing.lg },
  guestTitle: { fontSize: fontSizes.xl, fontWeight: '800', color: colors.text, marginBottom: spacing.xs },
  guestSub: { fontSize: fontSizes.sm, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: spacing.xl },
  loginBtn: {
    backgroundColor: colors.primary, paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md, borderRadius: borderRadius.round,
  },
  loginBtnText: { color: '#FFF', fontWeight: '700', fontSize: fontSizes.md },

  profileHeader: { backgroundColor: colors.surface, paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.lg },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary + '20',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: fontSizes.xl, fontWeight: '900', color: colors.primary },
  nameBlock: { flex: 1 },
  userName: { fontSize: fontSizes.xl, fontWeight: '900', color: colors.text },
  userEmail: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  settingsBtn: { padding: spacing.xs },

  divider: { height: 8, backgroundColor: colors.borderLight },

  section: { backgroundColor: colors.surface, marginBottom: 8, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.text },
  seeAll: { fontSize: fontSizes.sm, color: colors.primary, fontWeight: '700', textDecorationLine: 'underline' },

  orderCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  orderLogoWrap: { position: 'relative' },
  orderLogo: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.borderLight },
  checkBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 18, height: 18, borderRadius: 9, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.surface,
  },
  orderInfo: { flex: 1 },
  orderMerchant: { fontSize: fontSizes.md, fontWeight: '800', color: colors.text, marginBottom: 4 },
  starsRow: { flexDirection: 'row', gap: 2 },
  reviewBtn: {},
  reviewBtnText: { fontSize: fontSizes.sm, color: colors.primary, fontWeight: '600' },

  referralCard: {
    flexDirection: 'row', backgroundColor: colors.borderLight,
    borderRadius: borderRadius.lg, overflow: 'hidden', minHeight: 120,
  },
  referralImgWrap: {
    width: 120, backgroundColor: colors.primary + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  referralImgPlaceholder: { fontSize: 48 },
  referralContent: { flex: 1, padding: spacing.md, justifyContent: 'space-between' },
  referralTitle: { fontSize: fontSizes.md, fontWeight: '900', color: colors.primary },
  referralSub: { fontSize: fontSizes.xs, color: colors.text, lineHeight: 17, marginVertical: spacing.xs },
  referralCTA: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.surface, alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderRadius: borderRadius.round, borderWidth: 1, borderColor: colors.primary + '30',
  },
  referralCTAText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.primary },

  impactRow: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderRadius: borderRadius.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border,
  },
  impactCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.lg },
  impactDivider: { width: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  impactTitle: {
    fontSize: fontSizes.md, fontWeight: '800', color: colors.primary,
    textAlign: 'center', lineHeight: 20,
  },
  impactIcon: { fontSize: 40, marginVertical: spacing.sm },
  impactValue: { fontSize: 36, fontWeight: '900', color: colors.text },
  impactUnit: { fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: '600' },

  version: { textAlign: 'center', fontSize: fontSizes.xs, color: colors.textLight, marginTop: spacing.lg },
});

export default ProfileScreen;
