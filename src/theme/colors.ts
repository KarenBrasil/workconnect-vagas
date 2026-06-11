// src/theme/colors.ts
// TechConnect Design System v2

export const lightColors = {
  // Background
  background: '#F4F4F7',
  cardBackground: '#FFFFFF',
  tabBackground: '#FFFFFF',

  // Primary (Verde-Limão)
  primary: '#7AE04A',
  primaryDark: '#2B6010',
  primaryLight: 'rgba(122, 224, 74, 0.1)',

  // Secondary (Roxo)
  secondary: '#7C3AED',
  secondaryLight: 'rgba(124, 58, 237, 0.1)',

  // Illustrations
  illustrationGreen: '#1DB886',
  illustrationGray: '#C8C8C8',

  // Text
  textPrimary: '#111111',
  textSecondary: '#7A7A8A',
  textInverse: '#FFFFFF',

  // UI
  border: '#E8E8EE',
  danger: '#EF4444',
  success: '#22C55E',

  // Navigation
  tabActive: '#7AE04A',
  tabInactive: '#AFAFBF',

  // Aliases for compatibility
  bg: '#F4F4F7',
  surface: '#FFFFFF',
  textMain: '#111111',
  textLight: '#FFFFFF',
  accent: '#7C3AED',
  error: '#EF4444',
  warning: '#F59E0B',
  white: '#FFFFFF',
  black: '#000000',
};

export const darkColors = {
  background: '#0F172A',
  cardBackground: '#1A1F35',
  tabBackground: '#1A1F35',

  primary: '#7AE04A',
  primaryDark: '#2B6010',
  primaryLight: 'rgba(122, 224, 74, 0.15)',

  secondary: '#A78BFA',
  secondaryLight: 'rgba(167, 139, 250, 0.15)',

  illustrationGreen: '#1DB886',
  illustrationGray: '#555566',

  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textInverse: '#0F172A',

  border: '#2D3748',
  danger: '#F87171',
  success: '#4ADE80',

  tabActive: '#7AE04A',
  tabInactive: '#475569',

  // Aliases for compatibility
  bg: '#0F172A',
  surface: '#1E293B',
  textMain: '#F8FAFC',
  textLight: '#FFFFFF',
  accent: '#A78BFA',
  error: '#F87171',
  warning: '#FBBF24',
  white: '#FFFFFF',
  black: '#000000',
};

export type ThemeColors = typeof lightColors;
