import React from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeContext';

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 14,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.04,
    marginBottom: 8,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
  },
});

export const Card = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) => {
  const { colors } = useTheme();
  return (
  <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.black }, style]}>
    {children}
  </View>
)};

export const TextInputField = ({
  placeholder,
  value,
  onChangeText,
  icon,
  secureTextEntry = false,
  label,
  style,
  ...props
}: {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: string;
  secureTextEntry?: boolean;
  label?: string;
  style?: ViewStyle;
} & TextInputProps) => {
  const { colors, isDark } = useTheme();
  return (
  <View style={[styles.inputContainer, style]}>
    {label && <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>}
    <View style={[styles.inputField, { backgroundColor: isDark ? colors.background : '#F9F9FC', borderColor: colors.border }]}>
      {icon && (
        <MaterialIcons
          name={icon as any}
          size={16}
          color={colors.textSecondary}
          style={styles.inputIcon}
        />
      )}
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        style={[styles.input, { paddingLeft: icon ? 40 : 14, color: colors.textMain }]}
        placeholderTextColor={colors.textSecondary}
        {...props}
      />
    </View>
  </View>
)};
