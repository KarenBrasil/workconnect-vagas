import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import COLORS from './Colors';

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
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipActiveText: {
    color: COLORS.primaryDark,
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
  const colors = TAG_COLORS[variant];
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
}) => (
  <TouchableOpacity
    style={[
      styles.chip,
      active && {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
      },
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.chipText, active && styles.chipActiveText]}>
      {label}
    </Text>
  </TouchableOpacity>
);
