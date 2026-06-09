import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import COLORS from './Colors';

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 100,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 100,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  googleButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 100,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain,
    marginLeft: 8,
  },
});

export const PrimaryButton = ({
  label,
  onPress,
  style,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}) => (
  <TouchableOpacity
    style={[styles.primaryButton, style, disabled && { opacity: 0.5 }]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.8}
  >
    <Text style={styles.primaryButtonText}>{label}</Text>
  </TouchableOpacity>
);

export const OutlineButton = ({
  label,
  onPress,
  style,
}: {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
}) => (
  <TouchableOpacity
    style={[styles.outlineButton, style]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={styles.outlineButtonText}>{label}</Text>
  </TouchableOpacity>
);

export const GoogleButton = ({
  onPress,
}: {
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.googleButton}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <MaterialIcons name="language" size={18} color={COLORS.textMain} />
    <Text style={styles.googleButtonText}>Entrar com Google</Text>
  </TouchableOpacity>
);
