import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../hooks/useContexts';
import { useUI } from '../hooks/useContexts';
import { Button, Input } from '../components';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { validateEmail, validatePassword, validateName } from '../utils/helpers';



const ROLES = [
  { value: 'STUDENT', label: 'Student', icon: 'school-outline', desc: 'Browse and register for events' },
  { value: 'ORGANIZER', label: 'Organizer', icon: 'megaphone-outline', desc: 'Create and manage events' },
];

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const { showError } = useUI();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);


  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const validate = () => {
    const errs = {};
    if (!validateName(name)) errs.name = 'Enter your full name (min 2 characters)';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!validateEmail(email)) errs.email = 'Enter a valid email address';
    if (!validatePassword(password)) errs.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    const result = await register(name.trim(), email.trim().toLowerCase(), password, role);
    setLoading(false);
    if (!result.success) showError(result.error || 'Registration failed');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />

      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create account</Text>
        <Text style={styles.headerSubtitle}>Join your campus community</Text>
      </LinearGradient>
r
      <View style={styles.formContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            label="Full name"
            value={name}
            onChangeText={(t) => { setName(t); setErrors((e) => ({ ...e, name: null })); }}
            placeholder="Your full name"
            autoComplete="name"
            error={errors.name}
            icon={<Ionicons name="person-outline" size={18} color={COLORS.gray400} />}
            required
          />

          <Input
            label="Email address"
            value={email}
            onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: null })); }}
            placeholder="you@campus.edu"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            icon={<Ionicons name="mail-outline" size={18} color={COLORS.gray400} />}
            required
          />

          <Input
            label="Password"
            value={password}
            onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: null })); }}
            placeholder="Min. 6 characters"
            secureTextEntry
            error={errors.password}
            icon={<Ionicons name="lock-closed-outline" size={18} color={COLORS.gray400} />}
            required
          />

          <Input
            label="Confirm password"
            value={confirmPassword}
            onChangeText={(t) => { setConfirmPassword(t); setErrors((e) => ({ ...e, confirmPassword: null })); }}
            placeholder="Re-enter your password"
            secureTextEntry
            error={errors.confirmPassword}
            icon={<Ionicons name="shield-checkmark-outline" size={18} color={COLORS.gray400} />}
            required
          />

          {/* Role Selector */}
          <View style={styles.roleSection}>
            <Text style={styles.roleLabel}>I am a <Text style={styles.roleRequired}>*</Text></Text>
            <View style={styles.roleCards}>
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r.value}
                  style={[styles.roleCard, role === r.value && styles.roleCardSelected]}
                  onPress={() => setRole(r.value)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.roleIconWrap, role === r.value && styles.roleIconWrapSelected]}>
                    <Ionicons
                      name={r.icon}
                      size={22}
                      color={role === r.value ? COLORS.white : COLORS.gray500}
                    />
                  </View>
                  <Text style={[styles.roleName, role === r.value && styles.roleNameSelected]}>
                    {r.label}
                  </Text>
                  <Text style={styles.roleDesc}>{r.desc}</Text>
                  {role === r.value && (
                    <View style={styles.roleCheck}>
                      <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            size="lg"
            style={styles.registerBtn}
          />

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.loginLinkText}>Already have an account?</Text>
            <Text style={styles.loginLinkAction}> Sign in</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: SPACING.xl,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.65)',
    marginTop: SPACING.xs,
  },
  formContainer: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingTop: SPACING.xxl,
  },
  roleSection: {
    marginBottom: SPACING.xl,
  },
  roleLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  roleRequired: {
    color: COLORS.error,
  },
  roleCards: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  roleCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    position: 'relative',
    ...SHADOWS.sm,
  },
  roleCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F1FA',
  },
  roleIconWrap: {
    width: 46,
    height: 46,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  roleIconWrapSelected: {
    backgroundColor: COLORS.primary,
  },
  roleName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  roleNameSelected: {
    color: COLORS.primary,
  },
  roleDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  roleCheck: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  registerBtn: { marginTop: SPACING.sm },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
  },
  loginLinkText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  loginLinkAction: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.secondary,
  },
});
