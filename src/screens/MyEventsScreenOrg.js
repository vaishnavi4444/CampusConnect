import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEvents } from '../hooks/useContexts';
import { EventCard } from '../components';
import { EventCardSkeleton, EmptyState } from '../components/Loaders';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '../constants/theme';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_TABS = [
  {
    key: 'approved',
    label: 'Approved',
    icon: 'checkmark-circle',
    color: '#16A34A',       // green-600
    bgColor: '#DCFCE7',     // green-100
    dimColor: 'rgba(22,163,74,0.18)',
  },
  {
    key: 'pending',
    label: 'Pending',
    icon: 'time',
    color: '#D97706',       // amber-600
    bgColor: '#FEF3C7',     // amber-100
    dimColor: 'rgba(217,119,6,0.18)',
  },
  {
    key: 'rejected',
    label: 'Rejected',
    icon: 'close-circle',
    color: '#DC2626',       // red-600
    bgColor: '#FEE2E2',     // red-100
    dimColor: 'rgba(220,38,38,0.18)',
  },
];

// ─── Status Banner shown above each card ─────────────────────────────────────
function StatusBanner({ status }) {
  const cfg = STATUS_TABS.find((s) => s.key === status) || STATUS_TABS[0];
  const messages = {
    approved: 'Your registration is confirmed.',
    pending:  'Awaiting organiser approval.',
    rejected: 'Registration was not approved.',
  };
  return (
    <View style={[bannerStyles.wrap, { backgroundColor: cfg.bgColor }]}>
      <Ionicons name={cfg.icon} size={14} color={cfg.color} />
      <Text style={[bannerStyles.text, { color: cfg.color }]}>{messages[status]}</Text>
    </View>
  );
}

const bannerStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.md,
    marginBottom: -SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm,
  },
  text: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
  },
});

// ─── Tab pill ─────────────────────────────────────────────────────────────────
function TabPill({ config, active, count, onPress }) {
  return (
    <TouchableOpacity
      style={[
        tabStyles.pill,
        active && { backgroundColor: config.color },
        !active && { backgroundColor: config.dimColor },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons
        name={active ? config.icon : `${config.icon}-outline`}
        size={14}
        color={active ? '#fff' : config.color}
      />
      <Text style={[tabStyles.label, { color: active ? '#fff' : config.color }]}>
        {config.label}
      </Text>
      {count > 0 && (
        <View style={[tabStyles.badge, { backgroundColor: active ? 'rgba(255,255,255,0.3)' : config.bgColor }]}>
          <Text style={[tabStyles.badgeText, { color: active ? '#fff' : config.color }]}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const tabStyles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
  },
});

// ─── Summary strip ────────────────────────────────────────────────────────────
// function SummaryStrip({ events }) {
//   const counts = {
//     approved: events.filter((e) => e.status === 'approved').length,
//     pending:  events.filter((e) => e.status === 'pending').length,
//     rejected: events.filter((e) => e.status === 'rejected').length,
//   };
//   return (
//     <View style={stripStyles.row}>
//       {STATUS_TABS.map((s) => (
//         <View key={s.key} style={[stripStyles.cell, { backgroundColor: s.bgColor }]}>
//           <Text style={[stripStyles.num, { color: s.color }]}>{counts[s.key]}</Text>
//           <Text style={[stripStyles.lbl, { color: s.color }]}>{s.label}</Text>
//         </View>
//       ))}
//     </View>
//   );
// }

const stripStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: 2,
  },
  num: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
  },
  lbl: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
  },
});

// ─── Empty state messages per status ─────────────────────────────────────────
const EMPTY_CFG = {
  approved: {
    icon: 'checkmark-circle-outline',
    title: 'No approved events',
    subtitle: 'Once your registrations are approved, they\'ll show up here.',
  },
  pending: {
    icon: 'time-outline',
    title: 'No pending requests',
    subtitle: 'Events awaiting organiser approval will appear here.',
  },
  rejected: {
    icon: 'close-circle-outline',
    title: 'No rejected events',
    subtitle: 'Registrations that weren\'t approved will appear here.',
  },
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function MyEventsScreenOrg({ navigation }) {
  const insets = useSafeAreaInsets();
  const { myEvents, myEventsLoading, fetchMyEvents } = useEvents();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('approved');

  useEffect(() => { fetchMyEvents(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMyEvents();
    setRefreshing(false);
  };

  const filteredEvents = myEvents.filter((e) => e.status === activeTab);
  const activeCfg = STATUS_TABS.find((s) => s.key === activeTab);

  const renderHeader = () => (
    <View>
      {/* ── Top bar ── */}
      <View style={[styles.topBar, { paddingTop: insets.top + SPACING.md }]}>
        <View>
          <Text style={styles.screenTitle}>My Events</Text>
          <Text style={styles.screenSub}>{myEvents.length} total registrations</Text>
        </View>
        <View style={styles.totalBadge}>
          <Text style={styles.totalNum}>{myEvents.length}</Text>
        </View>
      </View>

      {/* ── Summary strip ── */}
      {/* <SummaryStrip events={myEvents} /> */}

      {/* ── Status tabs ── */}
      <View style={styles.tabRow}>
        {STATUS_TABS.map((cfg) => (
          <TabPill
            key={cfg.key}
            config={cfg}
            active={activeTab === cfg.key}
            count={myEvents.filter((e) => e.status === cfg.key).length}
            onPress={() => setActiveTab(cfg.key)}
          />
        ))}
      </View>

      {/* ── Active-tab heading ── */}
      <View style={[styles.tabHeading, { borderLeftColor: activeCfg.color }]}>
        <Ionicons name={activeCfg.icon} size={16} color={activeCfg.color} />
        <Text style={[styles.tabHeadingText, { color: activeCfg.color }]}>
          {activeCfg.label} Events
        </Text>
        <Text style={[styles.tabHeadingCount, { color: activeCfg.color }]}>
          ({filteredEvents.length})
        </Text>
      </View>
    </View>
  );

  if (myEventsLoading && !refreshing) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.listPad}>
          {[1, 2, 3].map((i) => <EventCardSkeleton key={i} />)}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => String(item.id)}
        // ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <View>
            {/* Status banner injected above each card */}
            <StatusBanner status={item.status} />
            <View style={styles.cardWrap}>
              <EventCard
                event={item}
                onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}
              />
              {/* Coloured left accent bar */}
              <View style={[styles.cardAccent, { backgroundColor: activeCfg.color }]} />
            </View>
          </View>
        )}
        ListEmptyComponent={() => {
          const cfg = EMPTY_CFG[activeTab];
          return (
            <EmptyState
              icon={cfg.icon}
              title={cfg.title}
              subtitle={cfg.subtitle}
              action={
                activeTab === 'approved' && (
                  <TouchableOpacity
                    style={[styles.browseBtn, { backgroundColor: activeCfg.color }]}
                    onPress={() => navigation.navigate('Home')}
                  >
                    <Ionicons name="search-outline" size={16} color="#fff" />
                    <Text style={styles.browseBtnText}>Browse Events</Text>
                  </TouchableOpacity>
                )
              }
            />
          );
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={activeCfg.color}
            colors={[activeCfg.color]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },

  // ── Header ──
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  screenTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  screenSub: {
    fontSize: FONT_SIZE.xs,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  totalBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalNum: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },

  // ── Tabs ──
  tabRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
    paddingTop: SPACING.md
  },

  // ── Tab heading ──
  tabHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.sm,
    paddingLeft: SPACING.sm,
    borderLeftWidth: 3,
  },
  tabHeadingText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  tabHeadingCount: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
  },

  // ── Card ──
  cardWrap: {
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.sm,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: BORDER_RADIUS.md,
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: BORDER_RADIUS.md,
    borderBottomLeftRadius: BORDER_RADIUS.md,
  },

  listContent: { paddingBottom: SPACING.xxxl },
  listPad: { padding: SPACING.xl },

  // ── Browse btn ──
  browseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
  },
  browseBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: '#fff',
  },
});