import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { colors, radius, spacing } from '../theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  dark?: boolean;
}

export function Input({ label, error, dark, style, ...props }: Props) {
  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, dark && styles.labelDark]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          dark && styles.inputDark,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={dark ? '#A3A3A3' : colors.textSecondary}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  labelDark: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  inputDark: {
    backgroundColor: '#111111',
    borderColor: '#333333',
    color: '#FFFFFF',
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    color: colors.error,
    fontSize: 12,
    marginTop: spacing.xs,
  },
});
