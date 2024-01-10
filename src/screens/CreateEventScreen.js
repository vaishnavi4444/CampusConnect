import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Modal, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEvents } from '../hooks/useContexts';
import { useUI } from '../hooks/useContexts';
import { Button, Input } from '../components';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS, CATEGORY_COLORS } from '../constants/theme';
import DateTimePicker from '@react-native-community/datetimepicker';

const CATEGORIES = ['Technology', 'Sports', 'Arts', 'Academic', 'Social', 'Workshop', 'Cultural', 'Other'];

function DateTimeField({ label, value, placeholder, icon, error, required, onPress }) {
  const hasValue = Boolean(value);
  return (
    <View style={dtStyles.wrapper}>
      <Text style={dtStyles.label}>
        {label}
        {required && <Text style={dtStyles.required}> *</Text>}
      </Text>
      <TouchableOpacity
        style={[
          dtStyles.field,
          error && dtStyles.fieldError,
          hasValue && dtStyles.fieldFilled,
        ]}
        onPress={onPress}
        activeOpacity={0.75}
      >
        <View style={dtStyles.iconWrap}>{icon}</View>
        <Text style={[dtStyles.valueText, !hasValue && dtStyles.placeholder]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={error ? COLORS.error : COLORS.gray400} />
      </TouchableOpacity>
      {error && (
        <View style={dtStyles.errorRow}>
          <Ionicons name="alert-circle-outline" size={13} color={COLORS.error} />
          <Text style={dtStyles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const dtStyles = StyleSheet.create({
  wrapper: { flex: 1, marginBottom: SPACING.lg },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.sm - 2,
  },
  required: { color: COLORS.error },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  fieldError: { borderColor: COLORS.error },
  fieldFilled: { borderColor: COLORS.primary + '55' },
  iconWrap: { width: 20, alignItems: 'center' },
  valueText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.medium,
  },
  placeholder: { color: COLORS.gray400, fontWeight: FONT_WEIGHT.regular },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  errorText: { fontSize: FONT_SIZE.xs, color: COLORS.error },
});

function IOSPickerModal({ visible, mode, tempDate, onConfirm, onCancel, onTempChange }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Pressable style={modalStyles.backdrop} onPress={onCancel} />
      <View style={modalStyles.sheet}>
        <View style={modalStyles.handle} />
        <View style={modalStyles.toolbar}>
          <TouchableOpacity onPress={onCancel} hitSlop={12}>
            <Text style={[modalStyles.toolbarBtn, { color: COLORS.gray500 }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={modalStyles.toolbarTitle}>
            {mode === 'date' ? 'Select Date' : 'Select Time'}
          </Text>
          <TouchableOpacity onPress={onConfirm} hitSlop={12}>
            <Text style={[modalStyles.toolbarBtn, { color: COLORS.primary }]}>Done</Text>
          </TouchableOpacity>
        </View>
        <DateTimePicker
          value={tempDate}
          mode={mode}
          display="spinner"
          is24Hour={false}
          onChange={(_, date) => date && onTempChange(date)}
          style={modalStyles.picker}
          textColor={COLORS.textPrimary}
        />
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  toolbarTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  toolbarBtn: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semiBold,
  },
  picker: { width: '100%' },
});

function formatDateISO(dateObj) {
  if (!dateObj || isNaN(dateObj)) return '';
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatTimeHHMM(dateObj) {
  if (!dateObj || isNaN(dateObj)) return '';
  const h = String(dateObj.getHours()).padStart(2, '0');   

  const m = String(dateObj.getMinutes()).padStart(2, '0'); 

  return `${h}:${m}`;
}

function formatDateDisplay(isoDate) {
  if (!isoDate) return '';
  const d = new Date(`${isoDate}T00:00:00`);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTimeDisplay(hhmm) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

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

  const [pickerMode, setPickerMode] = useState(null);

  const [tempDate, setTempDate] = useState(new Date());

  const isIOS = Platform.OS === 'ios';

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const openDatePicker = () => {
    const base = form.date ? new Date(`${form.date}T00:00:00`) : new Date();
    setTempDate(isNaN(base) ? new Date() : base);
    setPickerMode('date');
  };

  const openTimePicker = () => {
    const base = new Date();
    if (form.time) {
      const [h, m] = form.time.split(':').map(Number);
      base.setHours(h, m, 0, 0);
    }
    setTempDate(base);
    setPickerMode('time');
  };

  const confirmIOSPicker = () => {
    if (pickerMode === 'date') {
      setField('date', formatDateISO(tempDate));   

    } else {
      setField('time', formatTimeHHMM(tempDate));  

    }
    setPickerMode(null);
  };

  const onAndroidChange = (_event, selectedDate) => {
    setPickerMode(null);
    if (!selectedDate) return;
    if (pickerMode === 'date') {
      setField('date', formatDateISO(selectedDate));
    } else {
      setField('time', formatTimeHHMM(selectedDate));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Event title is required';
    if (!form.date) errs.date = 'Date is required';
    if (!form.time) errs.time = 'Time is required';
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
      behavior={isIOS ? 'padding' : undefined}
    >
      {}
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
        {}
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

        {}
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
                  <Text style={[
                    styles.categoryChipText,
                    selected && { color: catStyle.text, fontWeight: FONT_WEIGHT.bold },
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {}
        <SectionHeader title="Date & Time" icon="calendar-outline" />

        <View style={styles.row}>
          <DateTimeField
            label="Date"
            value={formatDateDisplay(form.date)}
            placeholder="Select date"
            icon={<Ionicons name="calendar-outline" size={18} color={errors.date ? COLORS.error : COLORS.gray400} />}
            error={errors.date}
            required
            onPress={openDatePicker}
          />
          <View style={styles.rowGap} />
          <DateTimeField
            label="Time"
            value={formatTimeDisplay(form.time)}
            placeholder="Select time"
            icon={<Ionicons name="time-outline" size={18} color={errors.time ? COLORS.error : COLORS.gray400} />}
            error={errors.time}
            required
            onPress={openTimePicker}
          />
        </View>

        {}
        {!isIOS && pickerMode !== null && (
          <DateTimePicker
            value={tempDate}
            mode={pickerMode}
            display="default"
            is24Hour
            onChange={onAndroidChange}
          />
        )}

        {}
        {isIOS && (
          <IOSPickerModal
            visible={pickerMode !== null}
            mode={pickerMode ?? 'date'}
            tempDate={tempDate}
            onTempChange={setTempDate}
            onConfirm={confirmIOSPicker}   

            onCancel={() => setPickerMode(null)}
          />
        )}

        {}
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
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  rowGap: { width: SPACING.md },
  createBtn: { marginTop: SPACING.md },
});