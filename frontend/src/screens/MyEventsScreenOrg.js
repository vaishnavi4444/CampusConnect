import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEvents } from '../hooks/useContexts';
import { EventCard } from '../components';
import { EventCardSkeleton, EmptyState } from '../components/Loaders';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '../constants/theme';

const STATUS_TABS = [
  {
    key: 'PUBLISHED',
    label: 'Published',
    icon: 'megaphone',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
    dimColor: 'rgba(124,58,237,0.18)',
  },
  {
    key: 'APPROVED',
    label: 'Approved',
    icon: 'checkmark-circle',
    color: '#16A34A',
    bgColor: '#DCFCE7',
    dimColor: 'rgba(22,163,74,0.18)',
  },
  {
    key: 'PENDING',
    label: 'Pending',
    icon: 'time',
    color: '#D97706',
    bgColor: '#FEF3C7',
    dimColor: 'rgba(217,119,6,0.18)',
  },
  {
    key: 'REJECTED',
    label: 'Rejected',
    icon: 'close-circle',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    dimColor: 'rgba(220,38,38,0.18)',
  },
];

function StatusBanner({ status }) {
  const cfg = STATUS_TABS.find((s) => s.key === status) || STATUS_TABS[0];
  const messages = {
    PUBLISHED: 'This event is open for registration.',
    APPROVED:  'Your event has been approved by admin.',
    PENDING:   'Awaiting admin approval.',
    REJECTED:  'This event was not approved.',
  };
  return (
    <View style={[bannerStyles.wrap, { backgroundColor: cfg.bgColor }]}>
      <Ionicons name={cfg.icon} size={14} color={cfg.color} />
      <Text style={[bannerStyles.text, { color: cfg.color }]}>
        {messages[status] ?? 'Status unknown.'}
      </Text>
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

function TabPill({ config, active, count, onPress }) {
  const outlineIcon = `${config.icon}-outline`;
  return (
    <TouchableOpacity
      style={[
        tabStyles.pill,
        active ? { backgroundColor: config.color } : { backgroundColor: config.dimColor },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons
        name={active ? config.icon : outlineIcon}
        size={14}
        color={active ? '#fff' : config.color}
      />
      <Text style={[tabStyles.label, { color: active ? '#fff' : config.color }]}>
        {config.label}
      </Text>
      {count > 0 && (
        <View style={[
          tabStyles.badge,
          { backgroundColor: active ? 'rgba(255,255,255,0.3)' : config.bgColor },
        ]}>
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

const EMPTY_CFG = {
  PUBLISHED: {
    icon: 'megaphone-outline',
    title: 'No published events',
    subtitle: 'Events open for registration will appear here.',
  },
  APPROVED: {
    icon: 'checkmark-circle-outline',
    title: 'No approved events',
    subtitle: 'Events approved by admin will show up here.',
  },
  PENDING: {
    icon: 'time-outline',
    title: 'No pending requests',
    subtitle: 'Events awaiting admin approval will appear here.',
  },
  REJECTED: {
    icon: 'close-circle-outline',
    title: 'No rejected events',
    subtitle: "Events that weren't approved will appear here.",
  },
};

export default function MyEventsScreenOrg({ navigation }) {
  const insets = useSafeAreaInsets();
  const { myEvents, myEventsLoading, fetchMyEvents } = useEvents();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('PUBLISHED');

  useEffect(() => { fetchMyEvents(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMyEvents();
    setRefreshing(false);
  };

  const filteredEvents = myEvents.filter((e) => e.status === activeTab);
  const activeCfg = STATUS_TABS.find((s) => s.key === activeTab);

  const Header = () => (
    <View>
      {}
      <View style={[styles.topBar, { paddingTop: insets.top + SPACING.md }]}>
        <View>
          <Text style={styles.screenTitle}>My Events</Text>
          <Text style={styles.screenSub}>{myEvents.length} total registrations</Text>
        </View>
        <View style={styles.totalBadge}>
          <Text style={styles.totalNum}>{myEvents.length}</Text>
        </View>
      </View>

      {}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabRow}
      >
        {STATUS_TABS.map((cfg) => (
          <TabPill
            key={cfg.key}
            config={cfg}
            active={activeTab === cfg.key}
            count={myEvents.filter((e) => e.status === cfg.key).length}
            onPress={() => setActiveTab(cfg.key)}
          />
        ))}
      </ScrollView>

      {}
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
        <Header />
        <View style={styles.listPad}>
          {[1, 2, 3].map((i) => <EventCardSkeleton key={i} />)}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View>
            <StatusBanner status={item.status} />
            <View style={styles.cardWrap}>
              <EventCard
                event={item}
                onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}
              />
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
                activeTab === 'PUBLISHED' ? (
                  <TouchableOpacity
                    style={[styles.browseBtn, { backgroundColor: activeCfg.color }]}
                    onPress={() => navigation.navigate('Home')}
                  >
                    <Ionicons name="search-outline" size={16} color="#fff" />
                    <Text style={styles.browseBtnText}>Browse Events</Text>
                  </TouchableOpacity>
                ) : null
              }
            />
          );
        }}
        contentContainerStyle={[
          styles.listContent,
          filteredEvents.length === 0 && styles.listContentEmpty,
        ]}
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

  tabRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },

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
  listContentEmpty: { flexGrow: 1 },
  listPad: { padding: SPACING.xl },

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