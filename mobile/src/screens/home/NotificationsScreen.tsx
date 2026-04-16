import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes, borderRadius } from '../../utils/theme';

interface NotifItem {
  id: string;
  icon: string;
  title: string;
  time: string;
  unread: boolean;
}

const MOCK_NOTIFS: NotifItem[] = [
  { id: '1', icon: '📦', title: "Nouveau panier chez Boulangerie Al Andalous — il reste 2 paniers !", time: "À l'instant", unread: true },
  { id: '2', icon: '✅', title: 'Votre commande chez Pizza Palace a été récupérée avec succès.', time: '2h', unread: true },
  { id: '3', icon: '⭐', title: 'Laissez un avis pour Café Marrakech et aidez la communauté.', time: '1j', unread: false },
  { id: '4', icon: '🔥', title: 'Offre flash : -70% chez Traiteur Fassi. Plus que 1 panier !', time: '2j', unread: false },
  { id: '5', icon: '🎁', title: 'Votre parrainage a été validé. 25 MAD crédités !', time: '3j', unread: false },
];

interface PrefRow {
  key: string;
  label: string;
  sub: string;
}

const PREFS: PrefRow[] = [
  { key: 'newOffers', label: 'Nouvelles offres', sub: 'Paniers disponibles près de vous' },
  { key: 'favorites', label: 'Favoris disponibles', sub: 'Quand un favori est de nouveau dispo' },
  { key: 'orders', label: 'Statut de commande', sub: 'Confirmations et rappels de retrait' },
  { key: 'promos', label: 'Promotions', sub: 'Offres flash et bons plans' },
];

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    newOffers: true, favorites: true, orders: true, promos: false,
  });

  const toggle = (key: string) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Preferences */}
        <Text style={styles.sectionLabel}>PRÉFÉRENCES</Text>
        <View style={styles.section}>
          {PREFS.map((pref, i) => (
            <View key={pref.key} style={[styles.prefRow, i < PREFS.length - 1 && styles.prefBorder]}>
              <View style={styles.prefText}>
                <Text style={styles.prefLabel}>{pref.label}</Text>
                <Text style={styles.prefSub}>{pref.sub}</Text>
              </View>
              <Switch
                value={prefs[pref.key]}
                onValueChange={() => toggle(pref.key)}
                trackColor={{ false: colors.border, true: colors.primary + '80' }}
                thumbColor={prefs[pref.key] ? colors.primary : colors.textLight}
              />
            </View>
          ))}
        </View>

        {/* Recent notifications */}
        <Text style={styles.sectionLabel}>RÉCENTES</Text>
        <View style={styles.section}>
          {MOCK_NOTIFS.map((n, i) => (
            <TouchableOpacity
              key={n.id}
              style={[styles.notifRow, i < MOCK_NOTIFS.length - 1 && styles.notifBorder, n.unread && styles.notifUnread]}
            >
              <Text style={styles.notifIcon}>{n.icon}</Text>
              <View style={styles.notifContent}>
                <Text style={[styles.notifTitle, n.unread && styles.notifTitleBold]} numberOfLines={2}>
                  {n.title}
                </Text>
                <Text style={styles.notifTime}>{n.time}</Text>
              </View>
              {n.unread && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}
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

  sectionLabel: {
    fontSize: fontSizes.xs, fontWeight: '700', color: colors.textSecondary,
    letterSpacing: 1.2, textTransform: 'uppercase',
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xs,
  },
  section: {
    backgroundColor: colors.surface,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border,
  },

  prefRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  prefBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  prefText: { flex: 1, marginRight: spacing.md },
  prefLabel: { fontSize: fontSizes.md, fontWeight: '600', color: colors.text },
  prefSub: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },

  notifRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  notifBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  notifUnread: { backgroundColor: colors.primary + '06' },
  notifIcon: { fontSize: 28, marginRight: spacing.md, marginTop: 2 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: fontSizes.sm, color: colors.text, lineHeight: 19 },
  notifTitleBold: { fontWeight: '700' },
  notifTime: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 4 },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.primary, marginTop: 6, marginLeft: spacing.xs,
  },
});

export default NotificationsScreen;
