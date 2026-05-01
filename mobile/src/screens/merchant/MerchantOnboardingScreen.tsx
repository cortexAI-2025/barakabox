import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../../store';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../../utils/theme';

const CATEGORIES = [
  { key: 'Restaurant',   label: 'Restaurant',           icon: '🍽️' },
  { key: 'Boulangerie',  label: 'Boulangerie & pâtisserie', icon: '🥐' },
  { key: 'Épicerie',     label: 'Épicerie',              icon: '🛒' },
  { key: 'Café',         label: 'Café',                  icon: '☕' },
  { key: 'Traiteur',     label: 'Traiteur',              icon: '🥘' },
];

const MerchantOnboardingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAppSelector((s) => s.auth);

  const [step, setStep]             = useState(1);
  const [loading, setLoading]       = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory]     = useState('');
  const [address, setAddress]       = useState('');
  const [city, setCity]             = useState('Casablanca');
  const [phone, setPhone]           = useState('');
  const [description, setDescription] = useState('');

  const canNext1 = businessName.trim().length > 0 && category.length > 0;
  const canNext2 = address.trim().length > 0 && city.trim().length > 0 && phone.trim().length > 0;

  const handleSubmit = async () => {
    setLoading(true);
    // In production: call merchantsAPI.create({ businessName, category, address, city, phone, description })
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    Alert.alert(
      'Demande envoyée !',
      'Votre demande d\'inscription a été soumise. Notre équipe vous contactera sous 48h.',
      [{ text: 'OK', onPress: () => navigation.goBack() }],
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inscrivez votre commerce</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressRow}>
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <View style={[styles.progressDot, step >= s && styles.progressDotActive]}>
              {step > s
                ? <Ionicons name="checkmark" size={12} color="#FFF" />
                : <Text style={[styles.progressNum, step >= s && styles.progressNumActive]}>{s}</Text>
              }
            </View>
            {s < 3 && <View style={[styles.progressLine, step > s && styles.progressLineActive]} />}
          </React.Fragment>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Step 1 — Infos générales */}
        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>Votre commerce</Text>
            <Text style={styles.stepSub}>Dites-nous qui vous êtes</Text>

            <Text style={styles.fieldLabel}>Nom du commerce *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Boulangerie Al Andalous"
              placeholderTextColor={colors.textLight}
              value={businessName}
              onChangeText={setBusinessName}
            />

            <Text style={styles.fieldLabel}>Catégorie *</Text>
            <View style={styles.catGrid}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.key}
                  style={[styles.catBtn, category === c.key && styles.catBtnActive]}
                  onPress={() => setCategory(c.key)}
                >
                  <Text style={styles.catIcon}>{c.icon}</Text>
                  <Text style={[styles.catLabel, category === c.key && styles.catLabelActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="Décrivez votre commerce et vos produits..."
              placeholderTextColor={colors.textLight}
              value={description}
              onChangeText={setDescription}
              multiline numberOfLines={4}
            />
          </View>
        )}

        {/* Step 2 — Coordonnées */}
        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>Localisation</Text>
            <Text style={styles.stepSub}>Où se trouve votre commerce ?</Text>

            <Text style={styles.fieldLabel}>Adresse *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 12 Rue Hassan II"
              placeholderTextColor={colors.textLight}
              value={address}
              onChangeText={setAddress}
            />

            <Text style={styles.fieldLabel}>Ville *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Casablanca"
              placeholderTextColor={colors.textLight}
              value={city}
              onChangeText={setCity}
            />

            <Text style={styles.fieldLabel}>Téléphone *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 06 00 00 00 00"
              placeholderTextColor={colors.textLight}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        )}

        {/* Step 3 — Récapitulatif */}
        {step === 3 && (
          <View>
            <Text style={styles.stepTitle}>Récapitulatif</Text>
            <Text style={styles.stepSub}>Vérifiez vos informations avant d'envoyer</Text>

            <View style={[styles.recapCard, shadows.sm]}>
              <RecapRow label="Commerce"   value={businessName} />
              <RecapRow label="Catégorie"  value={CATEGORIES.find((c) => c.key === category)?.label || ''} />
              {description ? <RecapRow label="Description" value={description} /> : null}
              <RecapRow label="Adresse"    value={address} />
              <RecapRow label="Ville"      value={city} />
              <RecapRow label="Téléphone"  value={phone} />
              <RecapRow label="Compte"     value={`${user?.firstName} ${user?.lastName}`} last />
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
              <Text style={styles.infoText}>
                Notre équipe examinera votre demande et vous contactera sous 48h pour finaliser votre inscription.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer buttons */}
      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity style={styles.backStepBtn} onPress={() => setStep((s) => s - 1)}>
            <Ionicons name="arrow-back" size={18} color={colors.text} />
            <Text style={styles.backStepText}>Retour</Text>
          </TouchableOpacity>
        )}
        {step < 3 ? (
          <TouchableOpacity
            style={[styles.nextBtn, !(step === 1 ? canNext1 : canNext2) && styles.nextBtnDisabled]}
            disabled={!(step === 1 ? canNext1 : canNext2)}
            onPress={() => setStep((s) => s + 1)}
          >
            <Text style={styles.nextBtnText}>Suivant</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#FFF" />
              : <Text style={styles.nextBtnText}>Envoyer ma demande</Text>
            }
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const RecapRow: React.FC<{ label: string; value: string; last?: boolean }> = ({ label, value, last }) => (
  <View style={[styles.recapRow, !last && styles.recapBorder]}>
    <Text style={styles.recapLabel}>{label}</Text>
    <Text style={styles.recapValue} numberOfLines={2}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: spacing.md, paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: fontSizes.md, fontWeight: '800', color: colors.text },

  progressRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing.lg, backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  progressDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.borderLight, alignItems: 'center', justifyContent: 'center',
  },
  progressDotActive: { backgroundColor: colors.primary },
  progressNum: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textSecondary },
  progressNumActive: { color: '#FFF' },
  progressLine: { flex: 1, height: 2, backgroundColor: colors.borderLight, maxWidth: 60 },
  progressLineActive: { backgroundColor: colors.primary },

  scroll: { padding: spacing.lg, paddingBottom: 120 },

  stepTitle: { fontSize: fontSizes.xxl, fontWeight: '900', color: colors.text, marginBottom: 4 },
  stepSub: { fontSize: fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.xl },

  fieldLabel: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.text, marginBottom: spacing.xs, marginTop: spacing.md },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
    fontSize: fontSizes.md, color: colors.text, backgroundColor: colors.surface,
  },
  inputMulti: { height: 100, textAlignVertical: 'top', paddingTop: spacing.sm },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  catBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.round, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  catBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catIcon: { fontSize: 16 },
  catLabel: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textSecondary },
  catLabelActive: { color: '#FFF' },

  recapCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg,
  },
  recapRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  recapBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  recapLabel: { fontSize: fontSizes.xs, color: colors.textSecondary, marginBottom: 2 },
  recapValue: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.text },

  infoBox: {
    flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start',
    backgroundColor: colors.primary + '10', borderRadius: borderRadius.md,
    padding: spacing.md, borderWidth: 1, borderColor: colors.primary + '25',
  },
  infoText: { flex: 1, fontSize: fontSizes.sm, color: colors.text, lineHeight: 19 },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: spacing.md, alignItems: 'center',
    padding: spacing.lg, paddingBottom: spacing.xl,
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border,
  },
  backStepBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingVertical: spacing.md, paddingHorizontal: spacing.md,
    borderRadius: borderRadius.round, borderWidth: 1.5, borderColor: colors.border,
  },
  backStepText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.text },
  nextBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, backgroundColor: colors.primary,
    paddingVertical: spacing.md, borderRadius: borderRadius.round,
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { fontSize: fontSizes.md, fontWeight: '800', color: '#FFF' },
  submitBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.round,
  },
});

export default MerchantOnboardingScreen;
