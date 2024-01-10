export const COLORS = {
  // Primary palette 
  primary: '#1A1F3A',
  primaryLight: '#252B4A',
  primaryDark: '#0F1225',
  accent: '#F59E0B',
  accentLight: '#FCD34D',
  accentDark: '#D97706',

  // Secondary
  secondary: '#3B82F6',
  secondaryLight: '#60A5FA',
  success: '#10B981',
  successLight: '#D1FAE5',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',

  // Neutrals
  white: '#FFFFFF',
  offWhite: '#F8F7F4',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Surface
  surface: '#FFFFFF',
  surfaceElevated: '#FAFAFA',
  border: '#E5E7EB',
  borderFocus: '#3B82F6',

  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Backgrounds
  bgPrimary: '#F8F7F4',
  bgCard: '#FFFFFF',
  bgModal: 'rgba(0,0,0,0.5)',

  // Category colors
  catTech: '#6366F1',
  catSports: '#10B981',
  catArts: '#EC4899',
  catSocial: '#F59E0B',
  catAcademic: '#3B82F6',
  catOther: '#8B5CF6',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 38,
};

export const FONT_WEIGHT = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    shadowColor: '#1A1F3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
};

export const CATEGORY_COLORS = {
  Technology: { bg: '#EEF2FF', text: '#4F46E5', dot: '#6366F1' },
  Sports: { bg: '#D1FAE5', text: '#059669', dot: '#10B981' },
  Arts: { bg: '#FCE7F3', text: '#DB2777', dot: '#EC4899' },
  Social: { bg: '#FEF3C7', text: '#D97706', dot: '#F59E0B' },
  Academic: { bg: '#DBEAFE', text: '#1D4ED8', dot: '#3B82F6' },
  Other: { bg: '#EDE9FE', text: '#7C3AED', dot: '#8B5CF6' },
  Workshop: { bg: '#FFF7ED', text: '#C2410C', dot: '#EA580C' },
  Cultural: { bg: '#FDF4FF', text: '#A21CAF', dot: '#C026D3' },
};
