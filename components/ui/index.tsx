import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ViewStyle, TextStyle, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

// ============================================
// PRIMARY BUTTON
// ============================================
export const ButtonPrimary = ({
  onPress,
  label,
  loading = false,
  disabled = false,
  style,
  labelStyle,
  icon,
  iconSize = 16,
}: {
  onPress: () => void;
  label: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  icon?: string;
  iconSize?: number;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled || loading}
    style={[
      styles.buttonPrimary,
      disabled && { opacity: 0.6 },
      style,
    ]}
    activeOpacity={0.85}
  >
    {icon && !loading && <FontAwesome name={icon} size={iconSize} color="#2B6010" style={{ marginRight: 8 }} />}
    <Text style={[styles.buttonPrimaryText, labelStyle]}>{label}</Text>
  </TouchableOpacity>
);

// ============================================
// OUTLINE/GHOST BUTTON
// ============================================
export const ButtonOutline = ({
  onPress,
  label,
  disabled = false,
  style,
  labelStyle,
  icon,
  iconSize = 16,
}: {
  onPress: () => void;
  label: string;
  disabled?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  icon?: string;
  iconSize?: number;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[styles.buttonOutline, disabled && { opacity: 0.6 }, style]}
    activeOpacity={0.85}
  >
    {icon && <FontAwesome name={icon} size={iconSize} color="#111111" style={{ marginRight: 6 }} />}
    <Text style={[styles.buttonOutlineText, labelStyle]}>{label}</Text>
  </TouchableOpacity>
);

// ============================================
// GOOGLE BUTTON
// ============================================
export const ButtonGoogle = ({
  onPress,
  label = 'Continuar com Google',
  disabled = false,
  style,
}: {
  onPress: () => void;
  label?: string;
  disabled?: boolean;
  style?: ViewStyle;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[styles.buttonOutline, style]}
    activeOpacity={0.85}
  >
    <FontAwesome name="google" size={16} color="#111111" style={{ marginRight: 10 }} />
    <Text style={styles.buttonOutlineText}>{label}</Text>
  </TouchableOpacity>
);

// ============================================
// CARD
// ============================================
export const Card = ({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}) => {
  const Component = onPress ? TouchableOpacity : View;
  return (
    <Component
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {children}
    </Component>
  );
};

// ============================================
// INPUT
// ============================================
export const Input = ({
  placeholder,
  value,
  onChangeText,
  icon,
  secureTextEntry = false,
  keyboardType = 'default',
  label,
  error,
  style,
  editable = true,
  ...props
}: {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  label?: string;
  error?: string;
  style?: ViewStyle;
  editable?: boolean;
  [key: string]: any;
}) => (
  <View style={style}>
    {label && <Text style={styles.inputLabel}>{label}</Text>}
    <View style={[styles.inputContainer, error && styles.inputError]}>
      {icon && (
        <FontAwesome
          name={icon}
          size={16}
          color="#BBBBC8"
          style={styles.inputIcon}
        />
      )}
      <TextInput
        style={[styles.input, { paddingLeft: icon ? 40 : 14 }]}
        placeholder={placeholder}
        placeholderTextColor="#BBBBC8"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={editable}
        {...props}
      />
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

// ============================================
// TAG / BADGE
// ============================================
export const Tag = ({
  label,
  variant = 'green',
  style,
}: {
  label: string;
  variant?: 'green' | 'purple' | 'gray';
  style?: ViewStyle;
}) => {
  const variants = {
    green: { bg: '#EDFBE3', text: '#1E5E06' },
    purple: { bg: '#EDE9FE', text: '#7C3AED' },
    gray: { bg: '#F0F0F5', text: '#555566' },
  };
  const colors = variants[variant];
  return (
    <View style={[styles.tag, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.tagText, { color: colors.text }]}>{label}</Text>
    </View>
  );
};

// ============================================
// FILTER CHIP
// ============================================
export const Chip = ({
  label,
  active = false,
  onPress,
  style,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.chip,
      active && styles.chipActive,
      style,
    ]}
    activeOpacity={0.8}
  >
    <Text
      style={[
        styles.chipText,
        active && styles.chipTextActive,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  // Buttons
  buttonPrimary: {
    backgroundColor: '#7AE04A',
    borderRadius: 100,
    paddingVertical: 15,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7AE04A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonPrimaryText: {
    color: '#2B6010',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#E8E8EE',
    borderRadius: 100,
    paddingVertical: 13,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOutlineText: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9FC',
    borderWidth: 1.5,
    borderColor: '#E8E8EE',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 6,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7A7A8A',
    textTransform: 'uppercase',
    letterSpacing: 0.04,
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    width: 16,
    height: 16,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#111111',
    paddingVertical: 0,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },

  // Tag
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

  // Chip
  chip: {
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: '#E8E8EE',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    backgroundColor: '#7AE04A',
    borderColor: '#7AE04A',
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#7A7A8A',
  },
  chipTextActive: {
    color: '#2B6010',
  },
});

export default {
  ButtonPrimary,
  ButtonOutline,
  ButtonGoogle,
  Card,
  Input,
  Tag,
  Chip,
};
