export const lightColors = {
  background: '#F9FAFB',
  cardBackground: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  primary: '#22C55E', // Vibrant Green
  primaryLight: '#22C55E15',
  primaryGradient: ['#22C55E', '#16A34A'],
  secondary: '#8B5CF6', // Vibrant Purple
  secondaryLight: '#8B5CF615',
  secondaryGradient: ['#8B5CF6', '#7C3AED'],
  iconBox: '#F3F4F6',
  badgeText: '#4B5563',
  badgeBackground: '#F3F4F6',
  tabBackground: '#FFFFFF',
  tabInactive: '#9CA3AF',
  tabActive: '#22C55E',
  error: '#EF4444',
  errorBackground: '#FEE2E2',
  glassBackground: 'rgba(255, 255, 255, 0.8)',
};

export const darkColors = {
  background: '#0B0F19', // Deep dark blue-ish tint
  cardBackground: '#111827',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  border: '#1F2937',
  primary: '#4ADE80', // Neon Green
  primaryLight: '#4ADE8015',
  primaryGradient: ['#4ADE80', '#22C55E'],
  secondary: '#A78BFA', // Soft Neon Purple
  secondaryLight: '#A78BFA15',
  secondaryGradient: ['#A78BFA', '#8B5CF6'],
  iconBox: '#1F2937',
  badgeText: '#D1D5DB',
  badgeBackground: '#374151',
  tabBackground: '#111827',
  tabInactive: '#6B7280',
  tabActive: '#4ADE80',
  error: '#F87171',
  errorBackground: '#7F1D1D',
  glassBackground: 'rgba(17, 24, 39, 0.8)',
};

export type ThemeColors = typeof lightColors;
