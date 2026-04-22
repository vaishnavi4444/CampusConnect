import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    RefreshControl, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { formatDate, formatTime } from '../utils/helpers';
import { eventsAPI, getErrorMessage } from '../api/endpoints';
import { Loader } from '../components/Loaders';

// ─── helpers ──────────────────────────────────────────────────────────────────
const isEventConcluded = (dateStr) => new Date(dateStr) < Date.now();

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, bg, note }) {
    return (
        <View style={[statStyles.card, { backgroundColor: bg }]}>
            <View style={[statStyles.iconWrap, { backgroundColor: color + '22' }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text style={[statStyles.value, { color }]}>{value ?? '—'}</Text>
            <Text style={statStyles.label}>{label}</Text>
            {note ? <Text style={[statStyles.note, { color }]}>{note}</Text> : null}
        </View>
    );
}

const statStyles = StyleSheet.create({
    card: {
        flex: 1,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.md,
        alignItems: 'center',
        gap: 4,
        ...SHADOWS.card,
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    value: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: FONT_WEIGHT.extrabold,
    },
    label: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textMuted,
        fontWeight: FONT_WEIGHT.medium,
        textAlign: 'center',
    },
    note: {
        fontSize: 10,
        fontWeight: FONT_WEIGHT.bold,
        marginTop: 1,
    },
});

// ─── Donut-style attendance bar ───────────────────────────────────────────────
function AttendanceBar({ checkins, registrations }) {
    const pct = registrations > 0 ? Math.round((checkins / registrations) * 100) : 0;
    return (
        <View style={barStyles.wrap}>
            <View style={barStyles.header}>
                <Text style={barStyles.title}>Attendance Rate</Text>
                <Text style={barStyles.pct}>{pct}%</Text>
            </View>
            <View style={barStyles.track}>
                <View style={[barStyles.fill, {
                    width: `${pct}%`,
                    backgroundColor: pct >= 75 ? COLORS.success ?? '#16A34A'
                        : pct >= 40 ? '#D97706'
                            : '#DC2626',
                }]} />
            </View>
            <View style={barStyles.legend}>
                <Text style={barStyles.legendItem}>
                    <Text style={{ color: '#16A34A', fontWeight: FONT_WEIGHT.bold }}>{checkins}</Text> checked in
                </Text>
                <Text style={barStyles.legendItem}>
                    <Text style={{ color: '#DC2626', fontWeight: FONT_WEIGHT.bold }}>{registrations - checkins}</Text> no-show
                </Text>
            </View>
        </View>
    );
}

const barStyles = StyleSheet.create({
    wrap: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        ...SHADOWS.card,
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
    title: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: COLORS.textPrimary },
    pct: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.extrabold, color: COLORS.primary },
    track: {
        height: 10,
        backgroundColor: COLORS.gray100 ?? '#F3F4F6',
        borderRadius: BORDER_RADIUS.full,
        overflow: 'hidden',
        marginBottom: SPACING.sm,
    },
    fill: { height: '100%', borderRadius: BORDER_RADIUS.full },
    legend: { flexDirection: 'row', justifyContent: 'space-between' },
    legendItem: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
});

// ─── Participant row ──────────────────────────────────────────────────────────
function ParticipantRow({ item, index, concluded }) {
    return (
        <View style={rowStyles.row}>
            <View style={rowStyles.avatar}>
                <Text style={rowStyles.avatarText}>
                    {item.user.name?.charAt(0).toUpperCase() ?? '?'}
                </Text>
            </View>
            <View style={rowStyles.info}>
                <Text style={rowStyles.name}>{item.user.name}</Text>
                <Text style={rowStyles.email}>{item.user.email}</Text>
            </View>
            {concluded ? (
                <View style={[
                    rowStyles.badge,
                    { backgroundColor: item.checkedIn ? '#DCFCE7' : '#FEE2E2' },
                ]}>
                    <Ionicons
                        name={item.checkedIn ? 'checkmark-circle' : 'close-circle'}
                        size={13}
                        color={item.checkedIn ? '#16A34A' : '#DC2626'}
                    />
                    <Text style={[
                        rowStyles.badgeText,
                        { color: item.checkedIn ? '#16A34A' : '#DC2626' },
                    ]}>
                        {item.checkedIn ? 'Attended' : 'No-show'}
                    </Text>
                </View>
            ) : (
                <View style={[rowStyles.badge, { backgroundColor: '#EEF2FF' }]}>
                    <Ionicons name="ticket-outline" size={13} color={COLORS.primary} />
                    <Text style={[rowStyles.badgeText, { color: COLORS.primary }]}>Registered</Text>
                </View>
            )}
        </View>
    );
}

const rowStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100 ?? '#F3F4F6',
        gap: SPACING.md,
        backgroundColor: COLORS.white,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary + '22',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.primary,
    },
    info: { flex: 1 },
    name: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: COLORS.textPrimary },
    email: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, marginTop: 1 },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.full,
    },
    badgeText: { fontSize: 11, fontWeight: FONT_WEIGHT.bold },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function EventAnalyticsScreen({ route, navigation }) {
    const { eventId } = route.params;
    const insets = useSafeAreaInsets();
    const [stats, setStats] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');


    const load = async (silent = false) => {
        if (!silent) setLoading(true);
        setError(null);
        try {
            const [statsRes, participantsRes] = await Promise.all([
                eventsAPI.getStats(eventId),
                eventsAPI.getParticipants(eventId),
            ]);
            setStats(statsRes.data?.data || statsRes.data);
            const raw = participantsRes.data?.data || participantsRes.data || [];
            setParticipants(Array.isArray(raw) ? raw : []);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { load(); }, []);


    const handleRefresh = () => { setRefreshing(true); load(true); };

    if (loading) return <Loader message="Loading analytics..." />;

    if (error || !stats) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Ionicons name="alert-circle-outline" size={56} color={COLORS.gray300} />
                <Text style={styles.errorText}>{error ?? 'Failed to load data'}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={() => load()}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const concluded = isEventConcluded(stats.event.date);
    const { metrics, event } = stats;

    const filteredParticipants = participants.filter((p) =>
        p.user.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.user.email?.toLowerCase().includes(search.toLowerCase())
    );

    // ── Capacity fill % ──
    const capacityPct = event.capacity
        ? Math.min(Math.round((metrics.registrations / event.capacity) * 100), 100)
        : null;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* ── Header ── */}
            <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color={COLORS.white} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{event.title}</Text>
                    <Text style={styles.headerSub}>
                        {formatDate(event.date)} · {event.venue}
                    </Text>
                </View>
                <View style={[styles.statusChip, { backgroundColor: concluded ? '#DCFCE7' : '#FEF3C7' }]}>
                    <View style={[styles.statusDot, { backgroundColor: concluded ? '#16A34A' : '#D97706' }]} />
                    <Text style={[styles.statusChipText, { color: concluded ? '#16A34A' : '#D97706' }]}>
                        {concluded ? 'Concluded' : 'Upcoming'}
                    </Text>
                </View>
            </LinearGradient>

            <FlatList
                data={filteredParticipants}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
                }
                ListHeaderComponent={() => (
                    <View>
                        {/* ── Stats section (always shown) ── */}
                        <View style={styles.statsSection}>
                            <View style={styles.statsRow}>
                                <StatCard
                                    icon="people-outline"
                                    label="Registered"
                                    value={metrics.registrations}
                                    color={COLORS.primary}
                                    bg={COLORS.white}
                                />
                                {concluded ? (
                                    <>
                                        <StatCard
                                            icon="checkmark-circle-outline"
                                            label="Attended"
                                            value={metrics.checkins}
                                            color="#16A34A"
                                            bg={COLORS.white}
                                        />
                                        <StatCard
                                            icon="close-circle-outline"
                                            label="No-shows"
                                            value={metrics.no_shows}
                                            color="#DC2626"
                                            bg={COLORS.white}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <StatCard
                                            icon="albums-outline"
                                            label="Capacity"
                                            value={event.capacity ?? '∞'}
                                            color="#7C3AED"
                                            bg={COLORS.white}
                                        />
                                        <StatCard
                                            icon="enter-outline"
                                            label="Available"
                                            value={metrics.available_seats ?? '∞'}
                                            color="#0891B2"
                                            bg={COLORS.white}
                                            note={capacityPct != null ? `${capacityPct}% full` : null}
                                        />
                                    </>
                                )}
                            </View>

                            {/* Capacity fill bar — pre-event */}
                            {!concluded && capacityPct != null && (
                                <View style={styles.capacityBarCard}>
                                    <View style={styles.capacityBarHeader}>
                                        <Text style={styles.capacityBarTitle}>Capacity</Text>
                                        <Text style={styles.capacityBarPct}>{capacityPct}%</Text>
                                    </View>
                                    <View style={styles.capacityTrack}>
                                        <View style={[styles.capacityFill, {
                                            width: `${capacityPct}%`,
                                            backgroundColor: capacityPct >= 90 ? '#DC2626' : capacityPct >= 70 ? '#D97706' : '#16A34A',
                                        }]} />
                                    </View>
                                    <Text style={styles.capacityNote}>
                                        {metrics.available_seats} of {event.capacity} seats remaining
                                    </Text>
                                </View>
                            )}

                            {/* Attendance rate bar — post-event */}
                            {concluded && (
                                <AttendanceBar
                                    checkins={metrics.checkins}
                                    registrations={metrics.registrations}
                                />
                            )}
                        </View>

                        {/* ── Participants heading ── */}
                        <View style={styles.listHeader}>
                            <Text style={styles.listTitle}>
                                {concluded ? 'Attendee List' : 'Registered Participants'}
                            </Text>
                            <Text style={styles.listCount}>{filteredParticipants.length}</Text>
                        </View>
                    </View>
                )}
                renderItem={({ item, index }) => (
                    <ParticipantRow item={item} index={index} concluded={concluded} />
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyWrap}>
                        <Ionicons name="people-outline" size={48} color={COLORS.gray300} />
                        <Text style={styles.emptyTitle}>No participants yet</Text>
                        <Text style={styles.emptySub}>Registrations will appear here once people sign up.</Text>
                    </View>
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bgPrimary },
    centered: { alignItems: 'center', justifyContent: 'center', gap: SPACING.md, padding: SPACING.xl },

    // ── Header
    header: {
        paddingHorizontal: SPACING.xl,
        paddingBottom: SPACING.lg,
        paddingTop: SPACING.md,
        gap: SPACING.sm,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerContent: { gap: 3 },
    headerTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: FONT_WEIGHT.extrabold,
        color: COLORS.white,
    },
    headerSub: {
        fontSize: FONT_SIZE.xs,
        color: 'rgba(255,255,255,0.7)',
    },
    statusChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        alignSelf: 'flex-start',
        paddingHorizontal: SPACING.md,
        paddingVertical: 5,
        borderRadius: BORDER_RADIUS.full,
    },
    statusDot: { width: 7, height: 7, borderRadius: 4 },
    statusChipText: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold },

    // ── Stats
    statsSection: {
        padding: SPACING.xl,
        paddingBottom: SPACING.sm,
        gap: SPACING.md,
    },
    statsRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },

    // ── Capacity bar (pre-event)
    capacityBarCard: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        ...SHADOWS.card,
    },
    capacityBarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.sm,
    },
    capacityBarTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
    },
    capacityBarPct: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.extrabold,
        color: COLORS.primary,
    },
    capacityTrack: {
        height: 10,
        backgroundColor: COLORS.gray100 ?? '#F3F4F6',
        borderRadius: BORDER_RADIUS.full,
        overflow: 'hidden',
        marginBottom: SPACING.sm,
    },
    capacityFill: { height: '100%', borderRadius: BORDER_RADIUS.full },
    capacityNote: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },

    // ── List header
    listHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100 ?? '#F3F4F6',
        backgroundColor: COLORS.white,
    },
    listTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
    },
    listCount: {
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.primary,
        backgroundColor: '#EEF2FF',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 3,
        borderRadius: BORDER_RADIUS.full,
    },

    listContent: { paddingBottom: SPACING.xxxl },

    // ── Empty
    emptyWrap: {
        alignItems: 'center',
        padding: SPACING.xxxl,
        gap: SPACING.sm,
    },
    emptyTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textSecondary,
    },
    emptySub: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textMuted,
        textAlign: 'center',
    },

    // ── Error
    errorText: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
        textAlign: 'center',
    },
    retryBtn: {
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
    },
    retryText: {
        color: COLORS.primary,
        fontWeight: FONT_WEIGHT.semibold,
        fontSize: FONT_SIZE.md,
    },
});