import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEvents } from '../hooks/useContexts';
import { useAuth } from '../hooks/useContexts';
import { useUI } from '../hooks/useContexts';
import { Button } from '../components';
import { Loader } from '../components/Loaders';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS, CATEGORY_COLORS } from '../constants/theme';
import { formatDate, formatTime, getCapacityPercent, getTimeUntilEvent } from '../utils/helpers';

export default function EventDetailsScreen({ route, navigation }) {
  const { eventId } = route.params;
  const insets = useSafeAreaInsets();
  const { currentEvent, fetchEventById, registerForEvent, cancelRegistration, publishEvent, deleteEvent } = useEvents();
  const { user, isOrganizer } = useAuth();
  const { showSuccess, showError } = useUI();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    setLoading(true);
    const result = await fetchEventById(eventId);
    setLoading(false);
    if (!result.success) showError(result.error);
  };

  const handleRegister = async () => {
    setActionLoading(true);
    const result = await registerForEvent(currentEvent.id);
    setActionLoading(false);
    if (result.success) {
      showSuccess('Successfully registered for this event!');
    } else {
      showError(result.error);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Registration',
      'Are you sure you want to cancel your registration?',
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Cancel Registration',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            const result = await cancelRegistration(currentEvent.id);
            setActionLoading(false);
            if (result.success) showSuccess('Registration cancelled');
            else showError(result.error);
          },
        },
      ]
    );
  };

  const handlePublish = async () => {
    setActionLoading(true);
    const result = await publishEvent(currentEvent.id);
    setActionLoading(false);
    if (result.success) showSuccess('Event published successfully!');
    else showError(result.error);
  };

  const handleDelete = () => {
    Alert.alert('Delete Event', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const result = await deleteEvent(currentEvent.id);
          if (result.success) {
            navigation.goBack();
            showSuccess('Event deleted');
          } else {
            showError(result.error);
          }
        },
      },
    ]);
  };

  if (loading) return <Loader message="Loading event..." />;
  if (!currentEvent) return (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={56} color={COLORS.gray300} />
      <Text style={styles.errorText}>Event not found</Text>
      <Button title="Go Back" onPress={() => navigation.goBack()} variant="outline" fullWidth={false} />
    </View>
  );

  const event = currentEvent;
  const categoryStyle = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.Other;
  const capacityPct = getCapacityPercent(event.registeredCount || 0, event.capacity);
  const isFull = capacityPct >= 100 && !event.isRegistered;
  const isOwner = isOrganizer && (event.organizer?.id === user?.id || event.organizerId === user?.id);
  const timeUntil = getTimeUntilEvent(event.date);
  const isPast = new Date(event.date) < new Date();

  const isApproved = event.status === 'APPROVED';
  const isPublished = event.status === 'PUBLISHED';

  const showManageSection = isOwner && (isApproved || isPublished);

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={COLORS.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight]}
          style={[styles.hero, { paddingTop: insets.top + 8 }]}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>

          {isOwner && (
            <View style={styles.ownerActions}>
              <TouchableOpacity style={styles.iconActionBtn} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.heroContent}>
            <View style={[styles.categoryBadge, { backgroundColor: categoryStyle.bg }]}>
              <Text style={[styles.categoryText, { color: categoryStyle.text }]}>{event.category || 'Event'}</Text>
            </View>
            <Text style={styles.heroTitle}>{event.title}</Text>

            {!isPast && (
              <View style={styles.timePill}>
                <Ionicons name="time-outline" size={14} color={COLORS.accent} />
                <Text style={styles.timePillText}>{timeUntil}</Text>
              </View>
            )}

            {event.status && event.status !== 'APPROVED' && (
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{event.status}</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {}
        <View style={styles.content}>
          {}
          <View style={styles.infoCard}>
            <InfoRow icon="calendar-outline" label="Date" value={formatDate(event.date)} />
            <View style={styles.divider} />
            <InfoRow icon="time-outline" label="Time" value={formatTime(event.date)} />
            <View style={styles.divider} />
            <InfoRow icon="location-outline" label="Venue" value={event.venue} />
            {event.organizer && (
              <>
                <View style={styles.divider} />
                <InfoRow
                  icon="person-outline"
                  label="Organizer"
                  value={event.organizer?.name || event.organizer}
                />
              </>
            )}
          </View>

          {}
          {event.capacity > 0 && (
            <View style={styles.capacityCard}>
              <View style={styles.capacityHeader}>
                <View style={styles.capacityLeft}>
                  <Ionicons name="people-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.capacityTitle}>Attendance</Text>
                </View>
                <Text style={[
                  styles.capacityCount,
                  capacityPct >= 100 && { color: COLORS.error },
                  capacityPct >= 80 && capacityPct < 100 && { color: COLORS.warning },
                ]}>
                  {event.registeredCount || 0} / {event.capacity}
                </Text>
              </View>
              <View style={styles.capacityBarBg}>
                <View style={[
                  styles.capacityBarFill,
                  {
                    width: `${capacityPct}%`,
                    backgroundColor: capacityPct >= 100 ? COLORS.error : capacityPct >= 80 ? COLORS.warning : COLORS.success,
                  },
                ]} />
              </View>
              <Text style={styles.capacitySubtext}>
                {event.capacity - (event.registeredCount || 0)} spots remaining
              </Text>
            </View>
          )}

          {}
          {event.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About this event</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>
          )}

          {}
          {event.isRegistered && (
            <TouchableOpacity
              style={styles.ticketBanner}
              onPress={() => navigation.navigate('Ticket', { event })}
              activeOpacity={0.85}
            >
              <View style={styles.ticketLeft}>
                <Ionicons name="ticket-outline" size={22} color={COLORS.primary} />
                <View>
                  <Text style={styles.ticketTitle}>Your ticket is ready</Text>
                  <Text style={styles.ticketSub}>Tap to view QR code</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          )}

          {}
          {showManageSection && (
            <View style={styles.organizerSection}>
              <Text style={styles.sectionTitle}>Manage Event</Text>

              {}
              {(isPublished) && (
                <Button
                  title={isPast ? 'View Attendees' : 'View Registered'}
                  onPress={() => navigation.navigate('EventAnalytics', { eventId: currentEvent.id })}
                  icon={<Ionicons name="people-outline" size={18} color={COLORS.white} />}
                  style={styles.attendedBtn}
                />
              )}

              {}
              {(isPublished) && (
                <Button
                  title="Scan QR Codes"
                  onPress={() => navigation.navigate('QRScanEvent', { eventId: currentEvent.id })}
                  variant="success"
                  icon={<Ionicons name="qr-code-outline" size={18} color={COLORS.white} />}
                  style={styles.qrScanBtn}
                />
              )}

              {}
              {isApproved && (
                isPast ? (
                  <View style={styles.missedPublishBanner}>
                    <Ionicons name="alert-circle-outline" size={16} color="#9CA3AF" />
                    <Text style={styles.missedPublishText}>
                      Publishing window passed — this event is over.
                    </Text>
                  </View>
                ) : (
                  <Button
                    title="Publish Event"
                    onPress={handlePublish}
                    loading={actionLoading}
                    variant="success"
                    icon={<Ionicons name="megaphone-outline" size={18} color={COLORS.white} />}
                    style={styles.publishBtn}
                  />
                )
              )}
            </View>
          )}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {}
      {!isOwner && !isPast && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + SPACING.md }]}>
          {event.isRegistered ? (
            <Button
              title="Cancel Registration"
              onPress={handleCancel}
              loading={actionLoading}
              variant="outline"
              icon={<Ionicons name="close-circle-outline" size={18} color={COLORS.primary} />}
            />
          ) : (
            <Button
              title={isFull ? 'Event Full' : 'Register Now'}
              onPress={handleRegister}
              loading={actionLoading}
              disabled={isFull}
              size="lg"
              icon={!isFull && <Ionicons name="add-circle-outline" size={20} color={COLORS.white} />}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  hero: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl,
    minHeight: 240,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  ownerActions: {
    position: 'absolute',
    right: SPACING.xl,
    top: 60,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  iconActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {},
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  categoryText: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold },
  heroTitle: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.white,
    lineHeight: 38,
    marginBottom: SPACING.md,
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  timePillText: { fontSize: FONT_SIZE.xs, color: COLORS.accent, fontWeight: FONT_WEIGHT.semibold },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.xs,
  },
  statusText: { fontSize: FONT_SIZE.xs, color: COLORS.white, fontWeight: FONT_WEIGHT.bold },
  content: {
    padding: SPACING.xl,
    marginTop: -24,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, fontWeight: FONT_WEIGHT.medium },
  infoValue: { fontSize: FONT_SIZE.md, color: COLORS.textPrimary, fontWeight: FONT_WEIGHT.semibold, marginTop: 1 },
  divider: { height: 1, backgroundColor: COLORS.gray100, marginVertical: SPACING.xs },
  capacityCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  capacityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  capacityLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  capacityTitle: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: COLORS.textPrimary },
  capacityCount: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: COLORS.success },
  capacityBarBg: { height: 8, backgroundColor: COLORS.gray100, borderRadius: BORDER_RADIUS.full, overflow: 'hidden', marginBottom: SPACING.sm },
  capacityBarFill: { height: '100%', borderRadius: BORDER_RADIUS.full },
  capacitySubtext: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: COLORS.textPrimary, marginBottom: SPACING.md },
  description: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary, lineHeight: 24 },
  ticketBanner: {
    backgroundColor: '#EEF2FF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
  },
  ticketLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  ticketTitle: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: COLORS.primary },
  ticketSub: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
  organizerSection: { marginBottom: SPACING.md },
  qrScanBtn: { marginBottom: SPACING.sm },
  attendedBtn: { marginBottom: SPACING.sm },
  publishBtn: { marginTop: SPACING.sm },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.lg,
  },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  errorText: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, color: COLORS.textSecondary },
  missedPublishBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.sm,
  },
  missedPublishText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    flex: 1,
  },

});