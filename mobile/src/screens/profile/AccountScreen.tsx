import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { colors, spacing, fontSizes, borderRadius } from '../../utils/theme';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  badge?: boolean;
  danger?: boolean;
  rightElement?: React.ReactNode;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onPress, badge, danger, rightElement }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.menuLeft}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={21} color={danger ? colors.error : colors.text} />
        {badge && <View style={styles.dot} />}
      </View>
      <Text style={[styles.menuLabel, danger && { color: colors.error }]}>{label}</Text>
    </View>
    {rightElement ?? <Ionicons name="chevron-forward" size={17} color={colors.textLight} />}
  </TouchableOpacity>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

const AccountScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  const handleLogout = () =>
    Alert.alert('Se déconnecter', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Se déconnecter', style: 'destructive',
        onPress: () => dispatch(logout()),
      },
    ]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestion de compte</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* VOTRE COMPTE */}
        <SectionHeader title="VOTRE COMPTE" />
        <View style={styles.section}>
          <MenuItem icon="person-circle-outline" label="Détails du compte" onPress={() => {}} />
          <MenuItem icon="card-outline" label="Cartes de paiement" onPress={() => {}} badge />
          <MenuItem icon="ticket-outline" label="Bons & remises" onPress={() => {}} />
          <MenuItem icon="gift-outline" label="Avantages Exclusifs" onPress={() => {}} />
          <MenuItem icon="notifications-outline" label="Notifications" onPress={() => navigation.navigate('Notifications')} />
          <MenuItem icon="headset-outline" label="Support" onPress={() => {}} />
        </View>

        {/* COMMUNAUTÉ */}
        <SectionHeader title="COMMUNAUTÉ" />
        <View style={styles.section}>
          <MenuItem
            icon="people-outline"
            label="Inviter des amis"
            onPress={() => navigation.navigate('Referral')}
          />
          <MenuItem icon="storefront-outline" label="Recommander un commerce" onPress={() => {}} />
          <MenuItem icon="business-outline" label="Inscrivez votre commerce alimentaire" onPress={() => {}} />
          <MenuItem
            icon="person-add-outline"
            label="Rejoindre BarakaBox"
            onPress={() => navigation.navigate('MerchantOnboarding')}
          />
        </View>

        {/* AUTRE */}
        <SectionHeader title="AUTRE" />
        <View style={styles.section}>
          <MenuItem icon="eye-off-outline" label="Commerces cachés" onPress={() => {}} />
          <MenuItem icon="newspaper-outline" label="Blog" onPress={() => {}} />
          <MenuItem icon="document-text-outline" label="Mentions légales" onPress={() => {}} />
        </View>

        {/* Logout button */}
        <View style={styles.logoutWrap}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: spacing.md, paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.text },

  sectionHeader: {
    fontSize: fontSizes.xs, fontWeight: '700', color: colors.textSecondary,
    letterSpacing: 1.2, textTransform: 'uppercase',
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xs,
  },
  section: {
    backgroundColor: colors.surface,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  iconWrap: { position: 'relative', width: 24, alignItems: 'center' },
  dot: {
    position: 'absolute', top: -3, right: -5,
    width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error,
    borderWidth: 1.5, borderColor: colors.surface,
  },
  menuLabel: { fontSize: fontSizes.md, color: colors.text, flex: 1 },

  logoutWrap: { padding: spacing.lg, paddingTop: spacing.xl },
  logoutBtn: {
    borderWidth: 1.5, borderColor: colors.error, borderRadius: borderRadius.round,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  logoutText: { fontSize: fontSizes.md, fontWeight: '700', color: colors.error },
});

export default AccountScreen;
