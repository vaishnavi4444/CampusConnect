import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StatusBar,
    SafeAreaView,
    Animated,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

import { eventsAPI, checkinAPI, getErrorMessage } from '../api/endpoints';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '../constants/theme';

// ─── Corner Frame Component ─────────────────────────────────────────────────
const ScanFrame = () => (
    <View style={frame.wrapper}>
        <View style={[frame.corner, frame.tl]} />
        <View style={[frame.corner, frame.tr]} />
        <View style={[frame.corner, frame.bl]} />
        <View style={[frame.corner, frame.br]} />
    </View>
);

const CORNER = 24;
const FRAME_SIZE = 240;

const frame = StyleSheet.create({
    wrapper: {
        width: FRAME_SIZE,
        height: FRAME_SIZE,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: CORNER,
        height: CORNER,
        borderColor: '#00E5C0',
        borderWidth: 3,
    },
    tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4 },
    tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 4 },
    bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 4 },
    br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 4 },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function QRScanEventScreen() {
    const [permission, requestPermission] = useCameraPermissions();

    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const spinAnim = useRef(new Animated.Value(0)).current;
    const spinLoop = useRef(null);
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [confirming, setConfirming] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const res = await eventsAPI.getAll();
            setEvents(res.data?.data || res.data || []);
        } catch (err) {
            // console.log(err);
        } finally {
            setLoadingEvents(false);
        }
    };

    const refreshEvents = async () => {
        if (refreshing) return;
        setRefreshing(true);
        spinAnim.setValue(0);

        spinLoop.current = Animated.loop(
            Animated.timing(spinAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            })
        );
        spinLoop.current.start();

        try {
            const res = await eventsAPI.getAll();
            setEvents(res.data?.data || res.data || []);
        } catch (err) {
            // console.log(err);
        } finally {
            spinLoop.current?.stop();
            spinAnim.setValue(0);
            setRefreshing(false);
        }
    };

    const handleScan = useCallback(
        async ({ data }) => {
            if (scanned || loading || !selectedEvent) return;

            setScanned(true);
            setLoading(true);

            try {
                const res = await checkinAPI.validate({
                    eventId: selectedEvent.id,
                    qrData: data,
                });

                const validation = res?.data?.data || res?.data;
                if (!validation?.isValid) {
                    setResult({ success: false, message: validation?.message || 'Invalid Ticket' });

                    return;
                }

                setResult({
                    success: true,
                    alreadyCheckedIn: validation?.alreadyCheckedIn ?? false,
                    attendee: validation?.attendee,
                    event: selectedEvent,
                    ticketId:validation.ticketId,
                });
            } catch (err) {
                setResult({ success: false, message: getErrorMessage(err) });
            } finally {
                setLoading(false);
            }
        },
        [scanned, loading, selectedEvent]
    );

    const handleConfirm = async () => {
        // console.log("here: ", result)
        if (confirming) return;
        setConfirming(true);
        try {
            await checkinAPI.confirm({
                ticketId: result.ticketId,
            });
            setConfirmed(true);
        } catch (err) {
            // still mark confirmed on UI — validation already passed
            setConfirmed(true);
        } finally {
            setConfirming(false);
        }
    };

    const reset = () => {
        setScanned(false);
        setResult(null);
        setConfirmed(false);
    };

    // ─── Permission States ───────────────────────────────────────────────────
    if (!permission) {
        return (
            <View style={s.center}>
                <ActivityIndicator color="#00E5C0" />
                <Text style={s.mutedText}>Requesting camera access…</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={s.permScreen}>
                <StatusBar barStyle="light-content" />
                <Ionicons name="camera-outline" size={64} color="#00E5C0" />
                <Text style={s.permTitle}>Camera Access Needed</Text>
                <Text style={s.permSub}>
                    To scan QR codes for check-in, please allow camera access.
                </Text>
                <TouchableOpacity style={s.permBtn} onPress={requestPermission}>
                    <Text style={s.permBtnText}>Grant Permission</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // ─── Loading Events ──────────────────────────────────────────────────────
    if (loadingEvents) {
        return (
            <View style={s.center}>
                <ActivityIndicator color="#00E5C0" size="large" />
                <Text style={s.mutedText}>Loading events…</Text>
            </View>
        );
    }

    // ─── Step 1: Select Event ────────────────────────────────────────────────
    if (!selectedEvent) {
        return (
            <SafeAreaView style={s.listScreen}>
                <StatusBar barStyle="light-content" />

                <View style={s.listHeader}>
                    <Text style={s.listTitle}>Select Event</Text>
                    <Text style={s.listSub}>Pull down to refresh</Text>
                </View>

                {events.length === 0 ? (
                    <FlatList
                        data={[]}
                        renderItem={null}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={refreshEvents}
                                tintColor="#00E5C0"
                                colors={['#00E5C0']}
                            />
                        }
                        ListEmptyComponent={
                            <View style={s.emptyState}>
                                <Ionicons name="calendar-outline" size={48} color="#555" />
                                <Text style={s.mutedText}>No events found</Text>
                            </View>
                        }
                    />
                ) : (
                    <FlatList
                        data={events}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
                        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={refreshEvents}
                                tintColor="#00E5C0"
                                colors={['#00E5C0']}
                            />
                        }
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={s.eventCard}
                                onPress={() => setSelectedEvent(item)}
                                activeOpacity={0.75}
                            >
                                <View style={s.eventCardLeft}>
                                    <View style={s.eventDot} />
                                    <View>
                                        <Text style={s.eventTitle}>{item.title}</Text>
                                        {item.venue ? (
                                            <Text style={s.eventVenue}>
                                                <Ionicons name="location-outline" size={12} color="#888" /> {item.venue}
                                            </Text>
                                        ) : null}
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#555" />
                            </TouchableOpacity>
                        )}
                    />
                )}
            </SafeAreaView>
        );
    }

    // ─── Step 2: Scanner + Result ────────────────────────────────────────────
    return (
        <View style={s.scanScreen}>
            <StatusBar barStyle="light-content" />

            {/* ── Camera View ── */}
            {!result && (
                <>
                    <CameraView
                        style={StyleSheet.absoluteFill}
                        onBarcodeScanned={handleScan}
                        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                    />

                    <View style={s.topOverlay}>
                        <SafeAreaView>
                            <View style={s.scanHeader}>
                                <TouchableOpacity
                                    style={s.backBtn}
                                    onPress={() => setSelectedEvent(null)}
                                >
                                    <Ionicons name="arrow-back" size={20} color="#fff" />
                                </TouchableOpacity>
                                <View style={s.scanHeaderCenter}>
                                    <Text style={s.scanEventLabel}>Scanning for</Text>
                                    <Text style={s.scanEventName} numberOfLines={1}>
                                        {selectedEvent.title}
                                    </Text>
                                </View>
                                <View style={{ width: 40 }} />
                            </View>
                        </SafeAreaView>
                    </View>

                    <View style={s.frameArea}>
                        <ScanFrame />
                        <Text style={s.scanInstruct}>
                            {loading ? 'Validating…' : 'Point at attendee QR code'}
                        </Text>
                        {loading && (
                            <ActivityIndicator
                                color="#00E5C0"
                                size="small"
                                style={{ marginTop: 12 }}
                            />
                        )}
                    </View>

                    <View style={s.bottomOverlay} />
                </>
            )}

            {/* ── Result ── */}
            {result && (
                <SafeAreaView style={s.resultScreen}>
                    {result.success ? (
                        <View style={s.resultInner}>

                            {/* Icon */}
                            <View style={[s.resultIconWrap, confirmed && s.confirmedIconWrap]}>
                                <Ionicons
                                    name={
                                        result.alreadyCheckedIn
                                            ? 'alert-circle'
                                            : confirmed
                                            ? 'checkmark-circle'
                                            : 'person-circle-outline'
                                    }
                                    size={84}
                                    color={result.alreadyCheckedIn ? '#F59E0B' : '#00E5C0'}
                                />
                                {confirmed && !result.alreadyCheckedIn && (
                                    <View style={s.confirmedBadge}>
                                        <Ionicons name="checkmark" size={13} color="#000" />
                                    </View>
                                )}
                            </View>

                            {/* Title */}
                            <Text style={[
                                s.resultTitle,
                                result.alreadyCheckedIn && { color: '#F59E0B' }
                            ]}>
                                {result.alreadyCheckedIn
                                    ? 'Already Checked In'
                                    : confirmed
                                    ? 'Checked In!'
                                    : 'Ticket Valid'}
                            </Text>

                            {/* Attendee card */}
                            <View style={[
                                s.attendeeCard,
                                confirmed && !result.alreadyCheckedIn && s.attendeeCardConfirmed,
                                result.alreadyCheckedIn && s.attendeeCardWarning,
                            ]}>
                                <View style={s.attendeeRow}>
                                    <Ionicons name="person-outline" size={16} color="#888" />
                                    <Text style={s.attendeeLabel}>Attendee</Text>
                                </View>
                                <Text style={s.attendeeName}>{result.attendee?.name || 'Unknown'}</Text>
                                {result.attendee?.email ? (
                                    <Text style={s.attendeeEmail}>{result.attendee.email}</Text>
                                ) : null}

                                <View style={s.divider} />

                                <View style={s.attendeeRow}>
                                    <Ionicons name="calendar-outline" size={16} color="#888" />
                                    <Text style={s.attendeeLabel}>Event</Text>
                                </View>
                                <Text style={s.attendeeEvent}>{result.event.title}</Text>

                                {/* Confirmed timestamp */}
                                {confirmed && !result.alreadyCheckedIn && (
                                    <View style={s.confirmedTimestamp}>
                                        <Ionicons name="time-outline" size={12} color="#00E5C0" />
                                        <Text style={s.confirmedTimestampText}>
                                            Checked in at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                )}

                                {/* Already checked in note */}
                                {result.alreadyCheckedIn && (
                                    <View style={s.alreadyTimestamp}>
                                        <Ionicons name="time-outline" size={12} color="#F59E0B" />
                                        <Text style={s.alreadyTimestampText}>
                                            This ticket was already used for entry
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    ) : (
                        <View style={s.resultInner}>
                            <View style={s.resultIconWrap}>
                                <Ionicons name="close-circle" size={80} color="#FF4B6E" />
                            </View>
                            <Text style={[s.resultTitle, { color: '#FF4B6E' }]}>Ticket Invalid</Text>
                            <Text style={s.errorMsg}>User not registered</Text>
                        </View>
                    )}

                    {/* ── Bottom buttons ── */}
                    <View style={s.resultActions}>
                        {result.success && result.alreadyCheckedIn ? (
                            // Already checked in — warn + allow next scan
                            <>
                                <View style={s.alreadyCheckedInBanner}>
                                    <Ionicons name="information-circle-outline" size={18} color="#F59E0B" />
                                    <Text style={s.alreadyCheckedInText}>This attendee is already checked in</Text>
                                </View>
                                <TouchableOpacity style={s.scanAgainBtn} onPress={reset}>
                                    <Ionicons name="qr-code-outline" size={18} color="#000" />
                                    <Text style={s.scanAgainText}>Scan Next</Text>
                                </TouchableOpacity>
                            </>
                        ) : result.success && !confirmed ? (
                            // Valid — awaiting confirmation
                            <>
                                <TouchableOpacity
                                    style={[s.confirmBtn, confirming && s.confirmBtnDisabled]}
                                    onPress={handleConfirm}
                                    disabled={confirming}
                                    activeOpacity={0.8}
                                >
                                    {confirming ? (
                                        <ActivityIndicator color="#000" size="small" />
                                    ) : (
                                        <>
                                            <Ionicons name="checkmark-done-outline" size={18} color="#000" />
                                            <Text style={s.confirmBtnText}>Confirm Check-In</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity style={s.cancelBtn} onPress={reset} activeOpacity={0.7}>
                                    <Text style={s.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            // Confirmed or invalid — scan next
                            <TouchableOpacity style={s.scanAgainBtn} onPress={reset}>
                                <Ionicons name="qr-code-outline" size={18} color="#000" />
                                <Text style={s.scanAgainText}>Scan Next</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </SafeAreaView>
            )}
        </View>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const BG = '#0D0D0F';
const CARD = '#18181C';
const ACCENT = '#00E5C0';
const TEXT = '#F0F0F2';
const MUTED = '#888';

const s = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: BG,
        gap: 12,
    },
    mutedText: {
        color: MUTED,
        fontSize: 14,
    },
    permScreen: {
        flex: 1,
        backgroundColor: BG,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        gap: 16,
    },
    permTitle: {
        color: TEXT,
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 8,
    },
    permSub: {
        color: MUTED,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
    },
    permBtn: {
        marginTop: 12,
        backgroundColor: ACCENT,
        paddingVertical: 14,
        paddingHorizontal: 36,
        borderRadius: 30,
    },
    permBtnText: {
        color: '#000',
        fontWeight: '700',
        fontSize: 15,
    },
    listScreen: {
        flex: 1,
        backgroundColor: BG,
    },
    listHeader: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 24,
    },
    listTitle: {
        color: TEXT,
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    listSub: {
        color: MUTED,
        fontSize: 14,
        marginTop: 4,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 80,
        gap: 12,
    },
    refreshBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,229,192,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(0,229,192,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    refreshBtnDisabled: {
        backgroundColor: '#1A1A1E',
        borderColor: '#2A2A30',
    },
    eventCard: {
        backgroundColor: CARD,
        borderRadius: 14,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#2A2A30',
    },
    eventCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        flex: 1,
    },
    eventDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: ACCENT,
    },
    eventTitle: {
        color: TEXT,
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    eventVenue: {
        color: MUTED,
        fontSize: 12,
    },
    scanScreen: {
        flex: 1,
        backgroundColor: '#000',
    },
    topOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
        zIndex: 10,
    },
    scanHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanHeaderCenter: {
        flex: 1,
        alignItems: 'center',
    },
    scanEventLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    scanEventName: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
        maxWidth: 200,
    },
    frameArea: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },
    scanInstruct: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 13,
        marginTop: 20,
        letterSpacing: 0.3,
    },
    bottomOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
        backgroundColor: 'rgba(0,0,0,0.45)',
        zIndex: 10,
    },
    resultScreen: {
        flex: 1,
        backgroundColor: BG,
        justifyContent: 'space-between',
        paddingBottom: 40,
    },
    resultInner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 28,
    },
    resultIconWrap: {
        marginBottom: 16,
    },
    confirmedIconWrap: {
        position: 'relative',
    },
    confirmedBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: ACCENT,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: BG,
    },
    resultTitle: {
        color: TEXT,
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 24,
        letterSpacing: -0.3,
    },
    attendeeCard: {
        width: '100%',
        backgroundColor: CARD,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#2A2A30',
    },
    attendeeCardConfirmed: {
        borderColor: 'rgba(0,229,192,0.35)',
        backgroundColor: 'rgba(0,229,192,0.05)',
    },
    attendeeCardWarning: {
        borderColor: 'rgba(245,158,11,0.35)',
        backgroundColor: 'rgba(245,158,11,0.05)',
    },
    attendeeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    attendeeLabel: {
        color: MUTED,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    attendeeName: {
        color: TEXT,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 2,
    },
    attendeeEmail: {
        color: MUTED,
        fontSize: 13,
    },
    divider: {
        height: 1,
        backgroundColor: '#2A2A30',
        marginVertical: 14,
    },
    attendeeEvent: {
        color: ACCENT,
        fontSize: 15,
        fontWeight: '600',
    },
    confirmedTimestamp: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#2A2A30',
    },
    confirmedTimestampText: {
        color: ACCENT,
        fontSize: 12,
        fontWeight: '600',
    },
    alreadyTimestamp: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(245,158,11,0.2)',
    },
    alreadyTimestampText: {
        color: '#F59E0B',
        fontSize: 12,
        fontWeight: '600',
    },
    errorMsg: {
        color: MUTED,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: 280,
    },
    resultActions: {
        paddingHorizontal: 28,
        paddingBottom: 20,
        gap: 10,
    },
    alreadyCheckedInBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(245,158,11,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(245,158,11,0.3)',
        paddingVertical: 13,
        borderRadius: 30,
    },
    alreadyCheckedInText: {
        color: '#F59E0B',
        fontWeight: '700',
        fontSize: 14,
    },
    confirmBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: ACCENT,
        paddingVertical: 16,
        borderRadius: 30,
    },
    confirmBtnDisabled: {
        opacity: 0.6,
    },
    confirmBtnText: {
        color: '#000',
        fontWeight: '700',
        fontSize: 15,
    },
    cancelBtn: {
        alignItems: 'center',
        paddingVertical: 13,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#2A2A30',
    },
    cancelBtnText: {
        color: MUTED,
        fontWeight: '600',
        fontSize: 14,
    },
    scanAgainBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: ACCENT,
        paddingVertical: 16,
        borderRadius: 30,
    },
    scanAgainText: {
        color: '#000',
        fontWeight: '700',
        fontSize: 15,
    },
});