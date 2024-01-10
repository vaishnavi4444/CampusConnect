import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useContexts';
import { useEvents } from '../hooks/useContexts';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { getInitials } from '../utils/helpers';

function SettingRow({ icon, label, value, onPress, danger, chevron = true }) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.settingIcon, danger && styles.settingIconDanger]}>
        <Ionicons name={icon} size={18} color={danger ? COLORS.error : COLORS.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, danger && styles.settingLabelDanger]}>{label}</Text>
        {value && <Text style={styles.settingValue}>{value}</Text>}
      </View>
      {onPress && chevron && (
        <Ionicons name="chevron-forward" size={16} color={COLORS.gray300} />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, logout, isOrganizer } = useAuth();
  const { myEvents, clearAll } = useEvents(); 

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            clearAll();   

            await logout(); 

          },
        },
      ]
    );
  };

  const upcomingCount = myEvents.filter((e) => new Date(e.date) >= Date.now()).length;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight]}
          style={[styles.header, { paddingTop: insets.top + SPACING.xl }]}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
            </View>
            <View style={[styles.roleBadge, isOrganizer && styles.roleBadgeOrganizer]}>
              <Ionicons
                name={isOrganizer ? 'megaphone' : 'school'}
                size={11}
                color={isOrganizer ? COLORS.primary : COLORS.white}
              />
              <Text style={[styles.roleText, isOrganizer && styles.roleTextOrganizer]}>
                {isOrganizer ? 'Organizer' : 'Student'}
              </Text>
            </View>
          </View>

          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{myEvents.length}</Text>
              <Text style={styles.statLabel}>Registered</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{upcomingCount}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{myEvents.length - upcomingCount}</Text>
              <Text style={styles.statLabel}>Attended</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.card}>
            <SettingRow icon="person-outline" label="Full Name" value={user?.name} chevron={false} />
            <View style={styles.rowDivider} />
            <SettingRow icon="mail-outline" label="Email Address" value={user?.email} chevron={false} />
            <View style={styles.rowDivider} />
            <SettingRow icon="shield-checkmark-outline" label="Account Role" value={user?.role || 'STUDENT'} chevron={false} />
          </View>

          <Text style={styles.sectionLabel}>Activity</Text>
          <View style={styles.card}>
            <SettingRow
              icon="calendar-outline"
              label="My Events"
              value={`${myEvents.length} registered`}
              onPress={() => navigation.navigate('MyEvents')}
            />
            <View style={styles.rowDivider} />
            <SettingRow
              icon="notifications-outline"
              label="Notifications"
              onPress={() => navigation.navigate('Notifications')}
            />
            {isOrganizer && (
              <>
                <View style={styles.rowDivider} />
                <SettingRow
                  icon="add-circle-outline"
                  label="Create New Event"
                  onPress={() => navigation.navigate('CreateEvent')}
                />
              </>
            )}
          </View>

          <Text style={styles.sectionLabel}>App</Text>
          <View style={styles.card}>
            <SettingRow
              icon="information-circle-outline"
              label="About"
              value="Campus Events v1.0"
              chevron={false}
            />
          </View>

          <View style={styles.card}>
            <SettingRow
              icon="log-out-outline"
              label="Sign Out"
              onPress={handleLogout}
              danger
              chevron={false}
            />
          </View>

          <Text style={styles.buildInfo}>Campus Events — Built for your campus community</Text>
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  header: {
    alignItems: 'center',
    paddingBottom: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
  avatarContainer: { alignItems: 'center', marginBottom: SPACING.md },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.25)',
    marginBottom: SPACING.sm,
  },
  avatarText: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  roleBadgeOrganizer: { backgroundColor: COLORS.accent },
  roleText: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, color: COLORS.white },
  roleTextOrganizer: { color: COLORS.primary },
  userName: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold, color: COLORS.white, marginBottom: SPACING.xs },
  userEmail: { fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.65)', marginBottom: SPACING.xl },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    width: '100%',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold, color: COLORS.white },
  statLabel: { fontSize: FONT_SIZE.xs, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  statDivider: { width: 1, height: '80%', backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center' },
  content: { padding: SPACING.xl, marginTop: -12 },
  sectionLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
    paddingLeft: SPACING.sm,
  },
  card: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, overflow: 'hidden', ...SHADOWS.sm },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  settingIcon: {
    width: 38, height: 38,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingIconDanger: { backgroundColor: COLORS.errorLight },
  settingContent: { flex: 1 },
  settingLabel: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.medium, color: COLORS.textPrimary },
  settingLabelDanger: { color: COLORS.error },
  settingValue: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted, marginTop: 1 },
  rowDivider: { height: 1, backgroundColor: COLORS.gray100, marginLeft: 54 + SPACING.md },
  buildInfo: { textAlign: 'center', fontSize: FONT_SIZE.xs, color: COLORS.textMuted, marginTop: SPACING.xl, fontStyle: 'italic' },
});