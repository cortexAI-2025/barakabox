import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Clipboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../../store';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../../utils/theme';

const REFERRAL_CODE = 'BARAKA2024';

const StepCard: React.FC<{ num: string; title: string; desc: string }> = ({ num, title, desc }) => (
  <View style={styles.stepCard}>
    <View style={styles.stepNum}>
      <Text style={styles.stepNumText}>{num}</Text>
    </View>
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepDesc}>{desc}</Text>
    </View>
  </View>
);

const ReferralScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAppSelector((s) => s.auth);
  const [copied, setCopied] = useState(false);

  const code = user ? `BARAKA-${user.firstName?.toUpperCase().slice(0, 4)}` : REFERRAL_CODE;

  const handleCopy = () => {
    Clipboard.setString(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    Share.share({
      message: `Rejoins BarakaBox et sauve des repas contre le gaspillage alimentaire ! Utilise mon code ${code} pour obtenir -25 MAD sur ta première commande. 🌱`,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inviter des amis</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>🤝</Text>
          <Text style={styles.heroTitle}>Gagnez ensemble{'\n'}25 MAD chacun</Text>
          <Text style={styles.heroSub}>
            Invitez vos amis à rejoindre BarakaBox. Pour chaque ami qui passe sa première commande, vous gagnez tous les deux un bon de 25 MAD.
          </Text>
        </View>

        {/* Code block */}
        <View style={[styles.codeCard, shadows.sm]}>
          <Text style={styles.codeLabel}>Votre code de parrainage</Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeValue}>{code}</Text>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color={copied ? colors.primary : colors.textSecondary} />
              <Text style={[styles.copyText, copied && { color: colors.primary }]}>
                {copied ? 'Copié !' : 'Copier'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Share button */}
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={20} color="#FFF" />
          <Text style={styles.shareBtnText}>Partager mon code</Text>
        </TouchableOpacity>

        {/* Steps */}
        <Text style={styles.stepsTitle}>Comment ça marche ?</Text>
        <StepCard num="1" title="Partagez votre code" desc="Envoyez votre lien ou code unique à vos amis." />
        <StepCard num="2" title="Votre ami s'inscrit" desc="Votre ami crée un compte et utilise votre code." />
        <StepCard num="3" title="Gagnez 25 MAD" desc="Après sa première commande, vous recevez tous les deux un bon de 25 MAD." />

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Amis parrainés</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>0 MAD</Text>
            <Text style={styles.statLabel}>Bons gagnés</Text>
          </View>
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

  scroll: { padding: spacing.lg },

  hero: { alignItems: 'center', paddingVertical: spacing.xl },
  heroIcon: { fontSize: 72, marginBottom: spacing.md },
  heroTitle: {
    fontSize: 26, fontWeight: '900', color: colors.text,
    textAlign: 'center', lineHeight: 32, marginBottom: spacing.sm,
  },
  heroSub: {
    fontSize: fontSizes.sm, color: colors.textSecondary,
    textAlign: 'center', lineHeight: 20,
  },

  codeCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  codeLabel: { fontSize: fontSizes.xs, color: colors.textSecondary, fontWeight: '600', marginBottom: spacing.sm },
  codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  codeValue: { fontSize: fontSizes.xxl, fontWeight: '900', color: colors.primary, letterSpacing: 2 },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  copyText: { fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: '600' },

  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, backgroundColor: colors.primary,
    borderRadius: borderRadius.round, paddingVertical: spacing.md,
    marginBottom: spacing.xl,
  },
  shareBtnText: { color: '#FFF', fontWeight: '800', fontSize: fontSizes.md },

  stepsTitle: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  stepCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
    marginBottom: spacing.md, backgroundColor: colors.surface,
    borderRadius: borderRadius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  stepNum: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  stepNumText: { fontSize: fontSizes.md, fontWeight: '900', color: '#FFF' },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text, marginBottom: 2 },
  stepDesc: { fontSize: fontSizes.sm, color: colors.textSecondary },

  statsRow: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border,
    marginTop: spacing.md, overflow: 'hidden',
  },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: spacing.lg },
  statDivider: { width: 1, backgroundColor: colors.border },
  statValue: { fontSize: fontSizes.xxl, fontWeight: '900', color: colors.text },
  statLabel: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
});

export default ReferralScreen;
