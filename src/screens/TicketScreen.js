import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, Share, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    COLORS, SPACING, FONT_SIZE, FONT_WEIGHT,
    BORDER_RADIUS, SHADOWS,
} from '../constants/theme';
import { formatDate, formatTime } from '../utils/helpers';
import { getErrorMessage, eventsAPI } from '../api/endpoints';
import { Loader } from '../components/Loaders';

const TicketDivider = () => (
    <View style={styles.dividerRow}>
        <View style={styles.notchLeft} />
        <View style={styles.dottedLine} />
        <View style={styles.notchRight} />
    </View>
);

const TicketField = ({ label, value, align = 'left' }) => (
    <View style={[styles.ticketField, { alignItems: align === 'right' ? 'flex-end' : 'flex-start' }]}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue} numberOfLines={2}>{value}</Text>
    </View>
);

export default function TicketScreen({ route, navigation }) {
    const { event } = route.params;
    const insets = useSafeAreaInsets();

    const [registration, setRegistration] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadRegistration();
    }, []);

    const loadRegistration = async () => {
        try {
            const response = await eventsAPI.getMyRegistration(event.id);
            const data = response.data?.data || response.data;
            //   console.log(data)
            setRegistration(data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `🎟️ My ticket for "${event.title}"\n📅 ${formatDate(event.date)} at ${formatTime(event.date)}\n📍 ${event.venue}\n\nTicket ID: ${registration?.ticketId}`,
            });
        } catch (_) { }
    };

    if (loading) return <Loader message="Loading your ticket..." />;

    if (error || !registration) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Ionicons name="alert-circle-outline" size={56} color={COLORS.gray300} />
                <Text style={styles.errorText}>Could not load ticket</Text>
                <Text style={styles.errorSub}>{error || 'Registration not found'}</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const qrUri = registration.qrCode.startsWith('data:')
        ? registration.qrCode
        : `data:image/png;base64,${registration.qrCode}`;

    const shortTicketId = registration.ticketId.slice(0, 8).toUpperCase();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Ticket</Text>
                <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
                    <Ionicons name="share-outline" size={22} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.ticketCard}>

                    <LinearGradient
                        colors={[COLORS.primary, COLORS.primaryLight]}
                        style={styles.ticketTop}
                    >
                        {registration.checkedIn && (
                            <View style={styles.checkedInBadge}>
                                <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                                <Text style={styles.checkedInText}>Checked In</Text>
                            </View>
                        )}

                        <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                        <Text style={styles.organizerName}>
                            {event.organizer?.name || 'Organizer'}
                        </Text>

                        <View style={styles.topFields}>
                            <TicketField label="DATE" value={formatDate(event.date)} />
                            <TicketField label="TIME" value={formatTime(event.date)} align="right" />
                        </View>
                        <TicketField label="VENUE" value={event.venue} />
                    </LinearGradient>

                    <TicketDivider />

                    <View style={styles.ticketBottom}>
                        <Text style={styles.qrInstruction}>Scan at the entrance</Text>

                        <View style={styles.qrWrapper}>
                            <Image
                                source={{ uri: qrUri }}
                                style={styles.qrImage}
                                resizeMode="contain"
                            />
                        </View>

                        <View style={styles.ticketIdRow}>
                            <Ionicons name="ticket-outline" size={14} color={COLORS.textMuted} />
                            <Text style={styles.ticketIdText}>#{shortTicketId}</Text>
                        </View>

                        <View style={[
                            styles.statusPill,
                            { backgroundColor: registration.checkedIn ? '#DCFCE7' : '#EEF2FF' },
                        ]}>
                            <View style={[
                                styles.statusDot,
                                { backgroundColor: registration.checkedIn ? COLORS.success : COLORS.primary },
                            ]} />
                            <Text style={[
                                styles.statusPillText,
                                { color: registration.checkedIn ? COLORS.success : COLORS.primary },
                            ]}>
                                {registration.checkedIn ? 'Attended' : 'Valid · Not yet scanned'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.note}>
                    <Ionicons name="information-circle-outline" size={16} color={COLORS.textMuted} />
                    <Text style={styles.noteText}>
                        Present this QR code at the venue entrance. Do not share it with others.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const TICKET_NOTCH = 18;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgPrimary,
    },
    centered: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.md,
        padding: SPACING.xl,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerBtn: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.sm,
        backgroundColor: COLORS.bgPrimary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
    },

    scrollContent: {
        padding: SPACING.xl,
        paddingBottom: SPACING.xxxl,
        alignItems: 'center',
    },

    ticketCard: {
        width: '100%',
        maxWidth: 360,
        borderRadius: BORDER_RADIUS.xl,
        backgroundColor: COLORS.white,
        overflow: 'hidden',
        ...SHADOWS.card,
    },

    ticketTop: {
        padding: SPACING.xl,
        paddingBottom: SPACING.lg,
        gap: SPACING.sm,
    },
    checkedInBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 3,
        borderRadius: BORDER_RADIUS.full,
        marginBottom: SPACING.xs,
    },
    checkedInText: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.white,
        fontWeight: FONT_WEIGHT.semibold,
    },
    eventTitle: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: FONT_WEIGHT.extrabold,
        color: COLORS.white,
        lineHeight: 30,
    },
    organizerName: {
        fontSize: FONT_SIZE.sm,
        color: 'rgba(255,255,255,0.75)',
        fontWeight: FONT_WEIGHT.medium,
        marginBottom: SPACING.sm,
    },
    topFields: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: SPACING.sm,
    },

    ticketField: {
        gap: 2,
        flex: 1,
    },
    fieldLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: FONT_WEIGHT.bold,
        letterSpacing: 1,
    },
    fieldValue: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.white,
        fontWeight: FONT_WEIGHT.semibold,
    },

    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    notchLeft: {
        width: TICKET_NOTCH,
        height: TICKET_NOTCH,
        borderRadius: TICKET_NOTCH / 2,
        backgroundColor: COLORS.bgPrimary,
        marginLeft: -TICKET_NOTCH / 2,
    },
    notchRight: {
        width: TICKET_NOTCH,
        height: TICKET_NOTCH,
        borderRadius: TICKET_NOTCH / 2,
        backgroundColor: COLORS.bgPrimary,
        marginRight: -TICKET_NOTCH / 2,
    },
    dottedLine: {
        flex: 1,
        borderTopWidth: 1.5,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        marginHorizontal: SPACING.sm,
    },

    ticketBottom: {
        padding: SPACING.xl,
        alignItems: 'center',
        gap: SPACING.md,
    },
    qrInstruction: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textMuted,
        fontWeight: FONT_WEIGHT.medium,
    },
    qrWrapper: {
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        backgroundColor: COLORS.white,
    },
    qrImage: {
        width: 200,
        height: 200,
    },
    ticketIdRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    ticketIdText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textMuted,
        fontWeight: FONT_WEIGHT.semibold,
        letterSpacing: 1.5,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
    },
    statusDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },
    statusPillText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.semibold,
    },

    // ── Note
    note: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: SPACING.sm,
        marginTop: SPACING.lg,
        paddingHorizontal: SPACING.md,
        maxWidth: 360,
    },
    noteText: {
        flex: 1,
        fontSize: FONT_SIZE.xs,
        color: COLORS.textMuted,
        lineHeight: 18,
    },

    // ── Error state
    errorText: {
        fontSize: FONT_SIZE.xl,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
    },
    errorSub: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textMuted,
        textAlign: 'center',
    },
    backButton: {
        marginTop: SPACING.sm,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
    },
    backButtonText: {
        color: COLORS.primary,
        fontWeight: FONT_WEIGHT.semibold,
        fontSize: FONT_SIZE.md,
    },
});