import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, SHADOWS } from '../constants/theme';

const TOAST_CONFIGS = {
  success: {
    bg: '#F0FDF4',
    border: COLORS.success,
    icon: 'checkmark-circle',
    iconColor: COLORS.success,
    textColor: '#166534',
  },
  error: {
    bg: '#FFF1F2',
    border: COLORS.error,
    icon: 'alert-circle',
    iconColor: COLORS.error,
    textColor: '#991B1B',
  },
  info: {
    bg: '#EFF6FF',
    border: COLORS.secondary,
    icon: 'information-circle',
    iconColor: COLORS.secondary,
    textColor: '#1E40AF',
  },
  warning: {
    bg: '#FFFBEB',
    border: COLORS.warning,
    icon: 'warning',
    iconColor: COLORS.warning,
    textColor: '#92400E',
  },
};

export default function Toast({ toast, onHide }) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (toast) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [toast]);

  if (!toast) return null;

  const config = TOAST_CONFIGS[toast.type] || TOAST_CONFIGS.info;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + SPACING.sm,
          transform: [{ translateY }],
          opacity,
          borderLeftColor: config.border,
          backgroundColor: config.bg,
        },
      ]}
    >
      <Ionicons name={config.icon} size={20} color={config.iconColor} />
      <Text style={[styles.message, { color: config.textColor }]} numberOfLines={3}>
        {toast.message}
      </Text>
      <TouchableOpacity onPress={onHide} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="close" size={18} color={config.textColor} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    gap: SPACING.sm,
    zIndex: 9999,
    ...SHADOWS.lg,
  },
  message: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    lineHeight: 18,
  },
});
