import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform, TouchableOpacity, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import { register, clearError } from '../../store/slices/authSlice';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { colors, spacing, fontSizes } from '../../utils/theme';

const RegisterScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const { isLoading } = useAppSelector((state) => state.auth);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = 'Prénom requis';
    if (!form.lastName.trim()) errs.lastName = 'Nom requis';
    if (!form.email && !form.phone) errs.email = 'Email ou téléphone requis';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email invalide';
    if (!form.password || form.password.length < 8) errs.password = 'Minimum 8 caractères';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Les mots de passe ne correspondent pas';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    dispatch(clearError());
    const { confirmPassword, ...data } = form;
    const result = await dispatch(register(data));
    if (register.rejected.match(result)) {
      Alert.alert('Erreur', result.payload as string);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>Rejoignez des milliers d'utilisateurs qui réduisent le gaspillage</Text>

        <View style={styles.row}>
          <View style={styles.half}>
            <Input label={t('auth.firstName')} placeholder="Hassan" value={form.firstName}
              onChangeText={set('firstName')} error={errors.firstName} />
          </View>
          <View style={[styles.half, { marginLeft: spacing.sm }]}>
            <Input label={t('auth.lastName')} placeholder="Alami" value={form.lastName}
              onChangeText={set('lastName')} error={errors.lastName} />
          </View>
        </View>

        <Input label={t('auth.email')} placeholder="votre@email.com" value={form.email}
          onChangeText={set('email')} error={errors.email} keyboardType="email-address"
          leftIcon="mail-outline" />

        <Input label={t('auth.phone')} placeholder="+212600000000" value={form.phone}
          onChangeText={set('phone')} keyboardType="phone-pad" leftIcon="call-outline" />

        <Input label={t('auth.password')} placeholder="••••••••" value={form.password}
          onChangeText={set('password')} error={errors.password} isPassword leftIcon="lock-closed-outline" />

        <Input label="Confirmer le mot de passe" placeholder="••••••••" value={form.confirmPassword}
          onChangeText={set('confirmPassword')} error={errors.confirmPassword} isPassword
          leftIcon="lock-closed-outline" />

        <Button title="Créer mon compte" onPress={handleRegister} loading={isLoading}
          fullWidth size="lg" style={{ marginTop: spacing.md }} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.hasAccount')} </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>{t('auth.login')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, padding: spacing.lg },
  back: { marginBottom: spacing.lg, marginTop: spacing.sm },
  backText: { color: colors.primary, fontWeight: '600' },
  title: { fontSize: fontSizes.xxl, fontWeight: '900', color: colors.text, marginBottom: spacing.xs },
  subtitle: { fontSize: fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.xl },
  row: { flexDirection: 'row' },
  half: { flex: 1 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl, marginBottom: spacing.lg },
  footerText: { color: colors.textSecondary },
  footerLink: { color: colors.primary, fontWeight: '700' },
});

export default RegisterScreen;
