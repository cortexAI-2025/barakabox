import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, KeyboardAvoidingView,
  Platform, TouchableOpacity, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import { login, clearError } from '../../store/slices/authSlice';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { colors, spacing, fontSizes } from '../../utils/theme';

const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email && !form.phone) errs.email = 'Email ou téléphone requis';
    if (!form.password) errs.password = 'Mot de passe requis';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    dispatch(clearError());
    const result = await dispatch(login(form));
    if (login.rejected.match(result)) {
      Alert.alert('Erreur', result.payload as string);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>🥗</Text>
          <Text style={styles.appName}>BarakaBox</Text>
          <Text style={styles.tagline}>Sauvez de la nourriture, économisez de l'argent</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>{t('auth.login')}</Text>

          <Input
            label={t('auth.email')}
            placeholder="votre@email.com"
            value={form.email}
            onChangeText={(v) => setForm({ ...form, email: v })}
            error={errors.email}
            leftIcon="mail-outline"
            keyboardType="email-address"
          />

          <Input
            label={t('auth.password')}
            placeholder="••••••••"
            value={form.password}
            onChangeText={(v) => setForm({ ...form, password: v })}
            error={errors.password}
            leftIcon="lock-closed-outline"
            isPassword
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotText}>{t('auth.forgotPassword')}</Text>
          </TouchableOpacity>

          <Button
            title={t('auth.login')}
            onPress={handleLogin}
            loading={isLoading}
            fullWidth
            size="lg"
            style={styles.loginBtn}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title={t('auth.guestMode')}
            onPress={() => navigation.navigate('Main')}
            variant="outline"
            fullWidth
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.noAccount')} </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>{t('auth.register')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, padding: spacing.lg },
  header: { alignItems: 'center', paddingVertical: spacing.xxl },
  logo: { fontSize: 56 },
  appName: { fontSize: fontSizes.xxxl, fontWeight: '900', color: colors.primary, marginTop: spacing.sm },
  tagline: { fontSize: fontSizes.sm, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
  form: { backgroundColor: colors.surface, borderRadius: 20, padding: spacing.lg, ...{
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  }},
  title: { fontSize: fontSizes.xl, fontWeight: '800', color: colors.text, marginBottom: spacing.lg },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: spacing.md },
  forgotText: { color: colors.primary, fontWeight: '600', fontSize: fontSizes.sm },
  loginBtn: { marginTop: spacing.xs },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: spacing.md, color: colors.textSecondary, fontSize: fontSizes.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { color: colors.textSecondary },
  footerLink: { color: colors.primary, fontWeight: '700' },
});

export default LoginScreen;
