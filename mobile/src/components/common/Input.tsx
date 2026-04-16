import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../utils/theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  isPassword?: boolean;
}

const Input: React.FC<Props> = ({ label, error, leftIcon, rightIcon, onRightIconPress, isPassword, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputRow, error && styles.inputError, props.editable === false && styles.disabled]}>
        {leftIcon && <Ionicons name={leftIcon} size={20} color={colors.textSecondary} style={styles.leftIcon} />}
        <TextInput
          style={[styles.input, leftIcon && styles.inputWithLeft, (rightIcon || isPassword) && styles.inputWithRight]}
          placeholderTextColor={colors.textLight}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.rightIcon}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Ionicons name={rightIcon} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderWidth: 1.5,
    borderColor: colors.border, borderRadius: borderRadius.md,
    minHeight: 52,
  },
  inputError: { borderColor: colors.error },
  disabled: { backgroundColor: colors.borderLight },
  input: {
    flex: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    fontSize: fontSizes.md, color: colors.text,
  },
  inputWithLeft: { paddingLeft: 0 },
  inputWithRight: { paddingRight: 0 },
  leftIcon: { marginLeft: spacing.md },
  rightIcon: { padding: spacing.md },
  errorText: { fontSize: fontSizes.xs, color: colors.error, marginTop: 4 },
});

export default Input;
