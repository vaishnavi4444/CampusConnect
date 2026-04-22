import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS, CATEGORY_COLORS } from '../constants/theme';
import { formatShortDate, formatTime, getCapacityPercent } from '../utils/helpers';

export default function EventCard({ event, onPress, compact = false, style }) {
  if (!event) return null;

  const categoryStyle = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.Other;
  const capacityPct = getCapacityPercent(event.registeredCount || 0, event.capacity);
  const isFull = capacityPct >= 100;
  const isAlmostFull = capacityPct >= 80 && !isFull;

  if (compact) {
    return (
      <TouchableOpacity style={[styles.compactCard, style]} onPress={onPress} activeOpacity={0.88}>
        <View style={[styles.compactAccent, { backgroundColor: categoryStyle.dot }]} />
        <View style={styles.compactContent}>
          <View style={styles.compactTop}>
            <Text style={styles.compactTitle} numberOfLines={1}>{event.title}</Text>
            {event.isRegistered && (
              <View style={styles.registeredBadge}>
                <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
              </View>
            )}
          </View>
          <View style={styles.compactMeta}>
            <Ionicons name="calendar-outline" size={12} color={COLORS.gray400} />
            <Text style={styles.compactMetaText}>{formatShortDate(event.date)}</Text>
            <View style={styles.metaDot} />
            <Ionicons name="location-outline" size={12} color={COLORS.gray400} />
            <Text style={styles.compactMetaText} numberOfLines={1}>{event.venue}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color={COLORS.gray300} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.88}>
      {/* Category bar */}
      <View style={[styles.categoryBar, { backgroundColor: categoryStyle.dot }]} />

      <View style={styles.cardContent}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryStyle.bg }]}>
            <Text style={[styles.categoryText, { color: categoryStyle.text }]}>
              {event.category || 'Event'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            {event.isRegistered && (
              <View style={styles.registeredPill}>
                <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
                <Text style={styles.registeredText}>Registered</Text>
              </View>
            )}
            {isFull && !event.isRegistered && (
              <View style={styles.fullPill}>
                <Text style={styles.fullText}>Full</Text>
              </View>
            )}
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>{event.title}</Text>

        {/* Description */}
        {event.description && (
          <Text style={styles.description} numberOfLines={2}>{event.description}</Text>
        )}

        {/* Meta info */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.gray400} />
            <Text style={styles.metaText}>{formatShortDate(event.date)}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={COLORS.gray400} />
            <Text style={styles.metaText}>{formatTime(event.date)}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color={COLORS.gray400} />
            <Text style={styles.metaText} numberOfLines={1}>{event.venue}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          {/* Capacity */}
          {event.capacity > 0 && (
            <View style={styles.capacitySection}>
              <View style={styles.capacityBar}>
                <View
                  style={[
                    styles.capacityFill,
                    {
                      width: `${capacityPct}%`,
                      backgroundColor: isFull
                        ? COLORS.error
                        : isAlmostFull
                        ? COLORS.warning
                        : COLORS.success,
                    },
                  ]}
                />
              </View>
              <Text style={[
                styles.capacityText,
                isFull && { color: COLORS.error },
                isAlmostFull && { color: COLORS.warning },
              ]}>
                {event.registeredCount || 0}/{event.capacity}
              </Text>
            </View>
          )}

          {/* Organizer */}
          {event.organizer && (
            <View style={styles.organizerRow}>
              <View style={styles.organizerAvatar}>
                <Text style={styles.organizerInitial}>
                  {(event.organizer?.name || event.organizer)[0]?.toUpperCase() || 'O'}
                </Text>
              </View>
              <Text style={styles.organizerName} numberOfLines={1}>
                {event.organizer?.name || event.organizer}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  categoryBar: {
    height: 4,
    width: '100%',
  },
  cardContent: {
    padding: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  categoryText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    letterSpacing: 0.3,
  },
  headerRight: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  registeredPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.successLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  registeredText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.success,
    fontWeight: FONT_WEIGHT.semibold,
  },
  fullPill: {
    backgroundColor: COLORS.errorLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  fullText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.error,
    fontWeight: FONT_WEIGHT.semibold,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    lineHeight: 24,
  },
  description: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.gray300,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    marginTop: SPACING.xs,
  },
  capacitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  capacityBar: {
    height: 4,
    width: 80,
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
  capacityText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHT.medium,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
    justifyContent: 'flex-end',
  },
  organizerAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  organizerInitial: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  organizerName: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    maxWidth: 100,
  },

  // Compact styles
  compactCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  compactAccent: {
    width: 3,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 2,
  },
  compactContent: {
    flex: 1,
    paddingLeft: SPACING.sm,
  },
  compactTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  compactTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  compactMetaText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.gray300,
    marginHorizontal: 2,
  },
  registeredBadge: {
    marginLeft: 4,
  },
});
