import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, borderRadius, fontSizes, spacing } from '../../utils/theme';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const Button: React.FC<Props> = ({
  title, onPress, variant = 'primary', size = 'md',
  loading, disabled, style, textStyle, fullWidth = false,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#FFF'} />
      ) : (
        <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },

  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.secondary },
  outline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.error },

  size_sm: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, minHeight: 36 },
  size_md: { paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.lg, minHeight: 48 },
  size_lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, minHeight: 56 },

  text: { fontWeight: '700', letterSpacing: 0.3 },
  text_primary: { color: '#FFF' },
  text_secondary: { color: '#FFF' },
  text_outline: { color: colors.primary },
  text_ghost: { color: colors.primary },
  text_danger: { color: '#FFF' },

  textSize_sm: { fontSize: fontSizes.sm },
  textSize_md: { fontSize: fontSizes.md },
  textSize_lg: { fontSize: fontSizes.lg },
});

export default Button;
