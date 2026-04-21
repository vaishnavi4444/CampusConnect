import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEvents } from '../hooks/useContexts';
import { useUI } from '../hooks/useContexts';
import { Button, Input } from '../components';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS, CATEGORY_COLORS } from '../constants/theme';

const CATEGORIES = ['Technology', 'Sports', 'Arts', 'Academic', 'Social', 'Workshop', 'Cultural', 'Other'];

export default function CreateEventScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { createEvent } = useEvents();
  const { showSuccess, showError } = useUI();

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    capacity: '',
    category: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Event title is required';
    if (!form.date.trim()) errs.date = 'Date is required (YYYY-MM-DD)';
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) errs.date = 'Format: YYYY-MM-DD';
    if (!form.time.trim()) errs.time = 'Time is required (HH:MM)';
    else if (!/^\d{2}:\d{2}$/.test(form.time)) errs.time = 'Format: HH:MM (24h)';
    if (!form.venue.trim()) errs.venue = 'Venue is required';
    if (!form.category) errs.category = 'Select a category';
    if (form.capacity && isNaN(Number(form.capacity))) errs.capacity = 'Must be a number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setLoading(true);

    const dateTime = new Date(`${form.date}T${form.time}:00`);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      date: dateTime.toISOString(),
      venue: form.venue.trim(),
      capacity: form.capacity ? Number(form.capacity) : undefined,
      category: form.category,
    };

    const result = await createEvent(payload);
    setLoading(false);

    if (result.success) {
      showSuccess('Event created successfully!');
      navigation.goBack();
    } else {
      showError(result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight]}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Event</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Basic Info */}
        <SectionHeader title="Basic Information" icon="information-circle-outline" />

        <Input
          label="Event Title"
          value={form.title}
          onChangeText={(t) => setField('title', t)}
          placeholder="e.g. Annual Tech Hackathon 2026"
          error={errors.title}
          icon={<Ionicons name="create-outline" size={18} color={COLORS.gray400} />}
          required
        />

        <Input
          label="Description"
          value={form.description}
          onChangeText={(t) => setField('description', t)}
          placeholder="Tell attendees what this event is about..."
          multiline
          numberOfLines={4}
          error={errors.description}
          icon={<Ionicons name="document-text-outline" size={18} color={COLORS.gray400} />}
        />

        {/* Category */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            Category <Text style={styles.required}>*</Text>
          </Text>
          {errors.category && (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle-outline" size={13} color={COLORS.error} />
              <Text style={styles.errorText}>{errors.category}</Text>
            </View>
          )}
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => {
              const catStyle = CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other;
              const selected = form.category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    selected && { backgroundColor: catStyle.bg, borderColor: catStyle.dot },
                    errors.category && !selected && styles.categoryChipError,
                  ]}
                  onPress={() => setField('category', cat)}
                  activeOpacity={0.8}
                >
                  {selected && (
                    <View style={[styles.catDot, { backgroundColor: catStyle.dot }]} />
                  )}
                  <Text style={[styles.categoryChipText, selected && { color: catStyle.text, fontWeight: FONT_WEIGHT.bold }]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Date & Time */}
        <SectionHeader title="Date & Time" icon="calendar-outline" />

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Input
              label="Date"
              value={form.date}
              onChangeText={(t) => setField('date', t)}
              placeholder="YYYY-MM-DD"
              error={errors.date}
              icon={<Ionicons name="calendar-outline" size={18} color={COLORS.gray400} />}
              required
            />
          </View>
          <View style={styles.halfInput}>
            <Input
              label="Time (24h)"
              value={form.time}
              onChangeText={(t) => setField('time', t)}
              placeholder="HH:MM"
              keyboardType="numbers-and-punctuation"
              error={errors.time}
              icon={<Ionicons name="time-outline" size={18} color={COLORS.gray400} />}
              required
            />
          </View>
        </View>

        {/* Venue & Capacity */}
        <SectionHeader title="Location & Capacity" icon="location-outline" />

        <Input
          label="Venue"
          value={form.venue}
          onChangeText={(t) => setField('venue', t)}
          placeholder="e.g. Main Auditorium, Room 204"
          error={errors.venue}
          icon={<Ionicons name="location-outline" size={18} color={COLORS.gray400} />}
          required
        />

        <Input
          label="Capacity"
          value={form.capacity}
          onChangeText={(t) => setField('capacity', t)}
          placeholder="Max attendees (leave empty for unlimited)"
          keyboardType="number-pad"
          error={errors.capacity}
          icon={<Ionicons name="people-outline" size={18} color={COLORS.gray400} />}
          hint="Leave empty for unlimited capacity"
        />

        <Button
          title="Create Event"
          onPress={handleCreate}
          loading={loading}
          size="lg"
          icon={<Ionicons name="add-circle-outline" size={20} color={COLORS.white} />}
          style={styles.createBtn}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SectionHeader({ title, icon }) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={18} color={COLORS.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingTop: SPACING.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  fieldGroup: { marginBottom: SPACING.lg },
  fieldLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.sm - 2,
  },
  required: { color: COLORS.error },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: SPACING.sm },
  errorText: { fontSize: FONT_SIZE.xs, color: COLORS.error },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm - 2,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  categoryChipError: { borderColor: COLORS.errorLight },
  catDot: { width: 7, height: 7, borderRadius: 4 },
  categoryChipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  row: { flexDirection: 'row', gap: SPACING.md },
  halfInput: { flex: 1 },
  createBtn: { marginTop: SPACING.md },
});
