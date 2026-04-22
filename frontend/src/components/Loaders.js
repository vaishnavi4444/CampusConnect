import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE } from '../constants/theme';

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

export function SkeletonLoader({ width, height, borderRadius = BORDER_RADIUS.sm, style }) {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: COLORS.gray200,
          opacity: pulse,
        },
        style,
      ]}
    />
  );
}

export function EventCardSkeleton() {
  return (
    <View style={skeletonStyles.card}>
      <SkeletonLoader width="100%" height={4} borderRadius={0} />
      <View style={skeletonStyles.content}>
        <View style={skeletonStyles.row}>
          <SkeletonLoader width={80} height={22} borderRadius={BORDER_RADIUS.full} />
        </View>
        <SkeletonLoader width="85%" height={22} style={{ marginBottom: SPACING.xs }} />
        <SkeletonLoader width="65%" height={16} style={{ marginBottom: SPACING.md }} />
        <View style={skeletonStyles.metaRow}>
          <SkeletonLoader width={80} height={14} borderRadius={BORDER_RADIUS.xs} />
          <SkeletonLoader width={60} height={14} borderRadius={BORDER_RADIUS.xs} />
          <SkeletonLoader width={70} height={14} borderRadius={BORDER_RADIUS.xs} />
        </View>
        <View style={skeletonStyles.footer}>
          <SkeletonLoader width={120} height={12} borderRadius={BORDER_RADIUS.xs} />
          <SkeletonLoader width={80} height={12} borderRadius={BORDER_RADIUS.xs} />
        </View>
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  content: {
    padding: SPACING.lg,
  },
  row: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  metaRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    marginTop: SPACING.xs,
  },
});

// ─── Empty State ──────────────────────────────────────────────────────────────

export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <View style={emptyStyles.container}>
      <View style={emptyStyles.iconWrapper}>
        <Ionicons name={icon || 'calendar-outline'} size={48} color={COLORS.gray300} />
      </View>
      <Text style={emptyStyles.title}>{title || 'Nothing here yet'}</Text>
      {subtitle && <Text style={emptyStyles.subtitle}>{subtitle}</Text>}
      {action}
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxxl,
    minHeight: 300,
  },
  iconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
});

// ─── Full Screen Loader ───────────────────────────────────────────────────────

export function Loader({ message }) {
  return (
    <View style={loaderStyles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      {message && <Text style={loaderStyles.text}>{message}</Text>}
    </View>
  );
}

const loaderStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgPrimary,
    gap: SPACING.md,
  },
  text: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
});
