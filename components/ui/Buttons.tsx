import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeContext';

const styles = StyleSheet.create({
  primaryButton: {
    borderRadius: 100,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderRadius: 100,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
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
    marginLeft: 8,
  },
});

export const PrimaryButton = ({
  label,
  onPress,
  style,
  disabled = false,
  icon,
}: {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
}) => {
  const { colors } = useTheme();
  return (
  <TouchableOpacity
    style={[
      styles.primaryButton, 
      { backgroundColor: colors.primary, shadowColor: colors.primary },
      style, 
      disabled && { opacity: 0.5 }
    ]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.8}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      {icon && <MaterialIcons name={icon} size={18} color={colors.primaryDark} style={{ marginRight: 8 }} />}
      <Text style={[styles.primaryButtonText, { color: colors.primaryDark }]}>{label}</Text>
    </View>
  </TouchableOpacity>
)};

export const OutlineButton = ({
  label,
  onPress,
  style,
  icon,
}: {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  icon?: keyof typeof MaterialIcons.glyphMap;
}) => {
  const { colors } = useTheme();
  return (
  <TouchableOpacity
    style={[styles.outlineButton, { borderColor: colors.border }, style]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      {icon && <MaterialIcons name={icon} size={18} color={colors.textMain} style={{ marginRight: 8 }} />}
      <Text style={[styles.outlineButtonText, { color: colors.textMain }]}>{label}</Text>
    </View>
  </TouchableOpacity>
)};

export const GoogleButton = ({
  onPress,
}: {
  onPress: () => void;
}) => {
  const { colors } = useTheme();
  return (
  <TouchableOpacity
    style={[styles.googleButton, { borderColor: colors.border }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <MaterialIcons name="language" size={18} color={colors.textMain} />
    <Text style={[styles.googleButtonText, { color: colors.textMain }]}>Entrar com Google</Text>
  </TouchableOpacity>
)};
