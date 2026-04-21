import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
import MyEventsScreen from '../screens/MyEventsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreateEventScreen from '../screens/CreateEventScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import { useAuth } from '../hooks/useContexts';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

const Tab = createBottomTabNavigator();

function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom + 6 }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const iconMap = {
          Home: isFocused ? 'home' : 'home-outline',
          MyEvents: isFocused ? 'calendar' : 'calendar-outline',
          Create: isFocused ? 'add-circle' : 'add-circle-outline',
          Notifications: isFocused ? 'notifications' : 'notifications-outline',
          Profile: isFocused ? 'person' : 'person-outline',
        };

        const labelMap = {
          Home: 'Home',
          MyEvents: 'My Events',
          Create: 'Create',
          Notifications: 'Alerts',
          Profile: 'Profile',
        };

        const isCreate = route.name === 'Create';

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (isCreate) {
          return (
            <TouchableOpacity
              key={route.key}
              style={styles.createTab}
              onPress={onPress}
              activeOpacity={0.85}
            >
              <View style={[styles.createBtn, isFocused && styles.createBtnActive]}>
                <Ionicons name="add" size={28} color={COLORS.white} />
              </View>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name={iconMap[route.name] || 'ellipse-outline'}
              size={24}
              color={isFocused ? COLORS.primary : COLORS.gray400}
            />
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {labelMap[route.name] || route.name}
            </Text>
            {isFocused && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabNavigator() {
  const { isOrganizer } = useAuth();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="MyEvents" component={MyEventsScreen} />
      {isOrganizer && (
        <Tab.Screen name="Create" component={CreateEventScreen} />
      )}
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.lg,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    position: 'relative',
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    color: COLORS.gray400,
    fontWeight: FONT_WEIGHT.medium,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  createTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
  },
  createBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
    ...SHADOWS.lg,
  },
  createBtnActive: {
    backgroundColor: COLORS.accent,
  },
});
