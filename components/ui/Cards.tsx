import React from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import COLORS from './Colors';

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 14,
    shadowColor: COLORS.black,
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
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.04,
    marginBottom: 8,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9FC',
    borderWidth: 1.5,
    borderColor: COLORS.border,
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
    color: COLORS.textMain,
  },
});

export const Card = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

export const TextInputField = ({
  placeholder,
  value,
  onChangeText,
  icon,
  secureTextEntry = false,
  label,
  style,
}: {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: string;
  secureTextEntry?: boolean;
  label?: string;
  style?: ViewStyle;
}) => (
  <View style={[styles.inputContainer, style]}>
    {label && <Text style={styles.inputLabel}>{label}</Text>}
    <View style={styles.inputField}>
      {icon && (
        <MaterialIcons
          name={icon as any}
          size={16}
          color={COLORS.textSecondary}
          style={styles.inputIcon}
        />
      )}
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        style={[styles.input, { paddingLeft: icon ? 40 : 14 }]}
        placeholderTextColor={COLORS.textSecondary}
      />
    </View>
  </View>
);
