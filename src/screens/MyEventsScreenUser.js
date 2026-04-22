import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEvents } from '../hooks/useContexts';
import { EventCard } from '../components';
import { EventCardSkeleton, EmptyState } from '../components/Loaders';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '../constants/theme';
import client from '../api/client'; // adjust path as needed
import { eventsAPI } from '../api/endpoints';

const TABS = ['Upcoming', 'Past'];

export default function MyEventsScreenUser({ navigation }) {
  const insets = useSafeAreaInsets();
  const [enrolledEvents, setEnrolledEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('Upcoming');

  // ✅ Use the enrolled endpoint for students
  const fetchEnrolledEvents = useCallback(async () => {
    try {
      const res = await eventsAPI.enrolled();
      const data = res?.data;
      // Handle null / undefined / non-array responrses gracefully
      setEnrolledEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch enrolled events:', err);
      setEnrolledEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnrolledEvents();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEnrolledEvents();
    setRefreshing(false);
  };

  const now = new Date();

  // ✅ Filter enrolled events by date for Upcoming / Past tabs
  const filteredEvents = enrolledEvents.filter((e) => {
    const eventDate = new Date(e.date);
    return activeTab === 'Upcoming' ? eventDate >= now : eventDate < now;
  });

  const getTabCount = (tab) =>
    enrolledEvents.filter((e) => {
      const d = new Date(e.date);
      return tab === 'Upcoming' ? d >= now : d < now;
    }).length;

  const renderHeader = () => (
    <View>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + SPACING.md }]}>
        <Text style={styles.screenTitle}>My Events</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{enrolledEvents.length}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {TABS.map((tab) => {
          const count = getTabCount(tab);
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
              {count > 0 && (
                <View style={[styles.tabBadge, activeTab === tab && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, activeTab === tab && styles.tabBadgeTextActive]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.list}>
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
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={activeTab === 'Upcoming' ? 'calendar-outline' : 'time-outline'}
            title={activeTab === 'Upcoming' ? 'No upcoming events' : 'No past events'}
            subtitle={
              activeTab === 'Upcoming'
                ? 'Register for events to see them here.'
                : "Events you've attended will appear here."
            }
            action={
              activeTab === 'Upcoming' && (
                <TouchableOpacity
                  style={styles.browseBtn}
                  onPress={() => navigation.navigate('Home')}
                >
                  <Ionicons name="search-outline" size={16} color={COLORS.white} />
                  <Text style={styles.browseBtnText}>Browse Events</Text>
                </TouchableOpacity>
              )
            }
          />
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
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
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  screenTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  countBadge: {
    backgroundColor: COLORS.accent,
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.primary,
    gap: SPACING.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm - 2,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  tabActive: {
    backgroundColor: COLORS.white,
  },
  tabText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: 'rgba(255,255,255,0.7)',
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  tabBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeActive: {
    backgroundColor: COLORS.primary,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  tabBadgeTextActive: {
    color: COLORS.white,
  },
  list: {
    paddingBottom: SPACING.xxxl,
  },
  browseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
  },
  browseBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.white,
  },
});