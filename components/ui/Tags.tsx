import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../src/theme/ThemeContext';

const styles = StyleSheet.create({
  tag: {
    borderRadius: 100,
    paddingHorizontal: 9,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  tagText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  chip: {
    borderRadius: 100,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  chipActiveText: {
    fontWeight: '700',
  },
});

const TAG_COLORS = {
  green: { bg: '#EDFBE3', text: '#1E5E06' },
  purple: { bg: '#EDE9FE', text: '#7C3AED' },
  gray: { bg: '#F0F0F5', text: '#555566' },
};

export const Tag = ({
  label,
  variant = 'gray',
}: {
  label: string;
  variant?: 'green' | 'purple' | 'gray';
}) => {
  const { isDark, colors: themeColors } = useTheme();
  
  // Adapt tag colors for dark mode
  const getTagColors = () => {
    if (variant === 'green') return { bg: isDark ? 'rgba(30, 94, 6, 0.2)' : '#EDFBE3', text: isDark ? '#4ADE80' : '#1E5E06' };
    if (variant === 'purple') return { bg: isDark ? 'rgba(124, 58, 237, 0.2)' : '#EDE9FE', text: isDark ? '#A78BFA' : '#7C3AED' };
    return { bg: isDark ? 'rgba(85, 85, 102, 0.2)' : '#F0F0F5', text: isDark ? '#94A3B8' : '#555566' };
  };
  
  const colors = getTagColors();

  return (
    <View style={[styles.tag, { backgroundColor: colors.bg }]}>
      <Text style={[styles.tagText, { color: colors.text }]}>{label}</Text>
    </View>
  );
};

export const FilterChip = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => {
  const { colors, isDark } = useTheme();
  return (
  <TouchableOpacity
    style={[
      styles.chip,
      { backgroundColor: colors.surface, borderColor: colors.border },
      active && {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
      },
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.chipText, { color: active ? colors.primaryDark : colors.textSecondary }, active && styles.chipActiveText]}>
      {label}
    </Text>
  </TouchableOpacity>
)};
