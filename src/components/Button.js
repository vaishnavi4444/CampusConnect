import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  fullWidth = true,
  style,
  textStyle,
}) {
  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    isDisabled && styles[`${variant}_disabled`],
    style,
  ];

  const textStyleFinal = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? COLORS.white : COLORS.primary}
        />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={textStyleFinal}>{title}</Text>
          {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },

  // Variants
  primary: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.md,
  },
  primary_disabled: {
    backgroundColor: COLORS.gray300,
    shadowOpacity: 0,
    elevation: 0,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
    ...SHADOWS.md,
  },
  secondary_disabled: {
    backgroundColor: COLORS.gray300,
  },
  accent: {
    backgroundColor: COLORS.accent,
    ...SHADOWS.md,
  },
  accent_disabled: {
    backgroundColor: COLORS.gray300,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  outline_disabled: {
    borderColor: COLORS.gray300,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  ghost_disabled: {},
  danger: {
    backgroundColor: COLORS.error,
    ...SHADOWS.md,
  },
  danger_disabled: {
    backgroundColor: COLORS.gray300,
  },
  success: {
    backgroundColor: COLORS.success,
    ...SHADOWS.md,
  },

  // Sizes
  size_sm: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    minHeight: 36,
  },
  size_md: {
    paddingVertical: 14,
    paddingHorizontal: SPACING.xl,
    minHeight: 48,
  },
  size_lg: {
    paddingVertical: 18,
    paddingHorizontal: SPACING.xxl,
    borderRadius: BORDER_RADIUS.lg,
    minHeight: 56,
  },

  // Text
  text: {
    fontWeight: FONT_WEIGHT.semibold,
    letterSpacing: 0.2,
  },
  text_primary: { color: COLORS.white },
  text_secondary: { color: COLORS.white },
  text_accent: { color: COLORS.primary },
  text_outline: { color: COLORS.primary },
  text_ghost: { color: COLORS.primary },
  text_danger: { color: COLORS.white },
  text_success: { color: COLORS.white },

  textSize_sm: { fontSize: FONT_SIZE.sm },
  textSize_md: { fontSize: FONT_SIZE.md },
  textSize_lg: { fontSize: FONT_SIZE.lg },
});
