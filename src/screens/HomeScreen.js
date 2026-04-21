import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, RefreshControl, ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEvents, useAuth } from '../hooks/useContexts';
import { EventCard } from '../components';
import { EventCardSkeleton, EmptyState } from '../components/Loaders';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { debounce, getInitials } from '../utils/helpers';

const CATEGORIES = ['All', 'Technology', 'Sports', 'Arts', 'Academic', 'Social', 'Workshop', 'Cultural'];

// Height of the greeting section that will collapse.
// Adjust this to match your actual rendered height.
const GREETING_HEIGHT = 72;

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { events, loading, fetchEvents } = useEvents();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  // Animated scroll value
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchEvents();
  }, []);

  const debouncedSearch = useCallback(
    debounce((q) =>
      fetchEvents({
        search: q,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
      }), 400),
    [selectedCategory]
  );

  const handleSearchChange = (text) => {
    setSearch(text);
    debouncedSearch(text);
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    fetchEvents({
      search: search || undefined,
      category: cat !== 'All' ? cat : undefined,
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEvents({
      search: search || undefined,
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
    });
    setRefreshing(false);
  };

  // --- Animated interpolations ---

  // Greeting fades out and shrinks as user scrolls down
  const greetingOpacity = scrollY.interpolate({
    inputRange: [0, GREETING_HEIGHT * 0.5, GREETING_HEIGHT],
    outputRange: [1, 0.4, 0],
    extrapolate: 'clamp',
  });

  const greetingHeight = scrollY.interpolate({
    inputRange: [0, GREETING_HEIGHT],
    outputRange: [GREETING_HEIGHT, 0],
    extrapolate: 'clamp',
  });

  // Slight scale-down for the greeting text for a natural collapse feel
  const greetingScale = scrollY.interpolate({
    inputRange: [0, GREETING_HEIGHT],
    outputRange: [1, 0.92],
    extrapolate: 'clamp',
  });

  // --- Sticky header rendered outside FlatList ---
  const renderStickyHeader = () => (
    <View style={{ backgroundColor: COLORS.primary }}>
      {/* Greeting — collapses on scroll */}
      <Animated.View
        style={[
          styles.greetingWrapper,
          {
            paddingTop: insets.top + SPACING.md,
            height: Animated.add(greetingHeight, insets.top + SPACING.md + SPACING.lg),
            opacity: greetingOpacity,
            transform: [{ scale: greetingScale }],
            overflow: 'hidden',
          },
        ]}
      >
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.name?.split(' ')[0] || 'there'}
            </Text>
            <Text style={styles.subtitle}>What's happening on campus?</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Search — always visible */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            placeholderTextColor={COLORS.gray400}
            value={search}
            onChangeText={handleSearchChange}
          />
        </View>
      </View>

      {/* Categories — always visible */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        bounces={false}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              selectedCategory === cat && styles.categoryChipSelected,
            ]}
            onPress={() => handleCategorySelect(cat)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === cat && styles.categoryChipTextSelected,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        {renderStickyHeader()}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory !== 'All' ? selectedCategory : 'All Events'}
          </Text>
          <Text style={styles.eventCount}>{events.length} events</Text>
        </View>
        <View style={styles.listContent}>
          {[1, 2, 3].map((i) => <EventCardSkeleton key={i} />)}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sticky header sits outside the scroll */}
      {renderStickyHeader()}

      {/* Section title + count */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {selectedCategory !== 'All' ? selectedCategory : 'All Events'}
        </Text>
        <Text style={styles.eventCount}>{events.length} events</Text>
      </View>

      <Animated.FlatList
        data={events}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={() =>
              navigation.navigate('EventDetails', { eventId: item.id })
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title="No events found"
            subtitle={
              search
                ? `No events match "${search}"`
                : 'Check back later for upcoming campus events.'
            }
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        // Drive scrollY from the FlatList's scroll position
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false } // height interpolation requires false
        )}
        scrollEventThrottle={16}
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
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  greetingWrapper: {
    backgroundColor: COLORS.primary,
    justifyContent: 'flex-end',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  greeting: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255,255,255,0.65)',
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },
  searchContainer: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 44,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  categoryChipSelected: {
    backgroundColor: COLORS.accent,
  },
  categoryChipText: {
    color: 'rgba(255,255,255,0.8)',
  },
  categoryChipTextSelected: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.bgPrimary,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
  },
  eventCount: {
    color: COLORS.textMuted,
  },
  listContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
});