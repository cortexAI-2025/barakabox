import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../../utils/theme';

const MenuItem: React.FC<{
  icon: string; label: string; onPress: () => void;
  badge?: string; color?: string; danger?: boolean;
}> = ({ icon, label, onPress, badge, color = colors.text, danger }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.menuIcon, { backgroundColor: (danger ? colors.error : colors.primary) + '15' }]}>
      <Ionicons name={icon as any} size={20} color={danger ? colors.error : colors.primary} />
    </View>
    <Text style={[styles.menuLabel, danger && { color: colors.error }]}>{label}</Text>
    {badge && <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>}
    {!danger && <Ionicons name="chevron-forward" size={18} color={colors.textLight} />}
  </TouchableOpacity>
);

const ProfileScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const { user } = useAppSelector((s) => s.auth);

  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      'Êtes-vous sûr de vouloir vous déconnecter?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: () => dispatch(logout()) },
      ]
    );
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'ar' : 'fr';
    i18n.changeLanguage(newLang);
  };

  if (!user) {
    return (
      <View style={styles.guestContainer}>
        <Text style={styles.guestIcon}>👤</Text>
        <Text style={styles.guestTitle}>Mode invité</Text>
        <Text style={styles.guestSubtitle}>Connectez-vous pour accéder à votre profil</Text>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
        >
          <Text style={styles.loginBtnText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.firstName[0]}{user.lastName[0]}
          </Text>
        </View>
        <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
        <Text style={styles.email}>{user.email || user.phone}</Text>
        {user.role === 'MERCHANT' && (
          <View style={styles.merchantBadge}>
            <Ionicons name="storefront" size={12} color={colors.primary} />
            <Text style={styles.merchantBadgeText}>Marchand</Text>
          </View>
        )}
      </View>

      {/* Referral Card */}
      <TouchableOpacity style={styles.referralCard}>
        <View style={styles.referralLeft}>
          <Text style={styles.referralTitle}>🎁 Parrainez un ami</Text>
          <Text style={styles.referralSubtitle}>Gagnez des réductions pour chaque invitation</Text>
        </View>
        <View style={styles.referralCode}>
          <Text style={styles.referralCodeText}>{user.referralCode?.slice(-6).toUpperCase()}</Text>
        </View>
      </TouchableOpacity>

      {/* Account Menu */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionLabel}>Mon compte</Text>
        <MenuItem icon="person-outline" label="Modifier le profil" onPress={() => {}} />
        <MenuItem icon="notifications-outline" label="Notifications" onPress={() => navigation.navigate('Notifications')} />
        <MenuItem icon="wallet-outline" label="Portefeuille" onPress={() => {}} badge="0 MAD" />
        <MenuItem icon="receipt-outline" label="Mes commandes" onPress={() => navigation.navigate('Orders')} />
      </View>

      {/* Merchant Menu */}
      {(user.role === 'MERCHANT' || user.role === 'ADMIN') && (
        <View style={styles.menuSection}>
          <Text style={styles.sectionLabel}>Espace marchand</Text>
          <MenuItem icon="storefront-outline" label="Tableau de bord" onPress={() => navigation.navigate('MerchantDashboard')} />
          <MenuItem icon="add-circle-outline" label="Créer une offre" onPress={() => navigation.navigate('CreateOffer')} />
          <MenuItem icon="bar-chart-outline" label="Analytiques" onPress={() => {}} />
        </View>
      )}

      {/* Preferences */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionLabel}>Préférences</Text>
        <MenuItem
          icon="language-outline"
          label={`Langue: ${i18n.language === 'fr' ? 'Français' : 'العربية'}`}
          onPress={toggleLanguage}
        />
        <MenuItem icon="help-circle-outline" label="Aide & Support" onPress={() => {}} />
        <MenuItem icon="information-circle-outline" label="À propos de BarakaBox" onPress={() => {}} />
      </View>

      {/* Logout */}
      <View style={[styles.menuSection, { marginBottom: spacing.xxl }]}>
        <MenuItem icon="log-out-outline" label={t('auth.logout')} onPress={handleLogout} danger />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  guestContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  guestIcon: { fontSize: 64, marginBottom: spacing.lg },
  guestTitle: { fontSize: fontSizes.xl, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  guestSubtitle: { fontSize: fontSizes.md, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  loginBtn: {
    backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    borderRadius: borderRadius.round,
  },
  loginBtnText: { color: '#FFF', fontWeight: '700', fontSize: fontSizes.md },

  profileHeader: {
    backgroundColor: colors.primary, paddingTop: 56, paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  avatarText: { fontSize: fontSizes.xxl, fontWeight: '900', color: '#FFF' },
  name: { fontSize: fontSizes.xl, fontWeight: '800', color: '#FFF' },
  email: { fontSize: fontSizes.sm, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  merchantBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: borderRadius.round, marginTop: spacing.sm,
  },
  merchantBadgeText: { fontSize: fontSizes.xs, color: colors.primary, fontWeight: '700' },

  referralCard: {
    flexDirection: 'row', alignItems: 'center', margin: spacing.lg,
    backgroundColor: colors.secondary + '15', borderRadius: borderRadius.lg,
    padding: spacing.md, borderWidth: 1.5, borderColor: colors.secondary + '40',
  },
  referralLeft: { flex: 1 },
  referralTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text },
  referralSubtitle: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  referralCode: {
    backgroundColor: colors.secondary, paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  referralCodeText: { fontSize: fontSizes.sm, fontWeight: '900', color: '#FFF', letterSpacing: 2 },

  menuSection: { marginTop: spacing.sm },
  sectionLabel: {
    fontSize: fontSizes.xs, fontWeight: '700', color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 1,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    backgroundColor: colors.borderLight,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: fontSizes.md, color: colors.text, fontWeight: '500' },
  badge: {
    backgroundColor: colors.primary + '15', paddingHorizontal: spacing.sm, paddingVertical: 2,
    borderRadius: borderRadius.round,
  },
  badgeText: { fontSize: fontSizes.xs, color: colors.primary, fontWeight: '700' },
});

export default ProfileScreen;
