import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette } from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';

interface TodoInputProps extends TextInputProps {
  label: string;
  error?: string;
  onClear?: () => void;
  showClearButton?: boolean;
  required?: boolean;
  characterLimit?: number;
}

export const TodoInput: React.FC<TodoInputProps> = ({
  label,
  value = '',
  onChangeText,
  error,
  onClear,
  showClearButton = true,
  required = false,
  characterLimit,
  multiline = false,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const hasValue = value.length > 0;
  const currentCount = value.length;

  return (
    <View style={styles.container}>
      {/* Label and Character Count */}
      <View style={styles.labelRow}>
        <View style={styles.labelWrapper}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.requiredAsterisk}>*</Text>}
        </View>
        {characterLimit && (
          <Text
            style={[
              styles.countText,
              currentCount > characterLimit && styles.countExceeded,
            ]}
          >
            {currentCount}/{characterLimit}
          </Text>
        )}
      </View>

      {/* Input Field Container */}
      <View
        style={[
          styles.inputContainer,
          multiline ? styles.multilineContainer : styles.singlelineContainer,
          isFocused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}
      >
        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            style,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={Palette.light.textPlaceholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          accessibilityLabel={label}
          {...props}
        />

        {showClearButton && hasValue && !multiline && onClear && (
          <Pressable
            onPress={onClear}
            hitSlop={10}
            style={styles.clearButton}
            accessibilityRole="button"
            accessibilityLabel="Clear input"
          >
            <Ionicons name="close-circle" size={18} color={Palette.light.textPlaceholder} />
          </Pressable>
        )}
      </View>

      {/* Error Message */}
      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={Palette.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  labelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.light.text,
  },
  requiredAsterisk: {
    fontSize: 14,
    color: Palette.danger,
    fontWeight: '700',
  },
  countText: {
    fontSize: 12,
    color: Palette.light.textMuted,
  },
  countExceeded: {
    color: Palette.danger,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.light.inputBg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Palette.light.inputBorder,
    paddingHorizontal: Spacing.md,
  },
  singlelineContainer: {
    height: 48,
  },
  multilineContainer: {
    minHeight: 100,
    paddingVertical: Spacing.sm,
    alignItems: 'flex-start',
  },
  inputFocused: {
    borderColor: Palette.primary,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: Palette.danger,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Palette.light.text,
    padding: 0,
  },
  multilineInput: {
    minHeight: 80,
  },
  clearButton: {
    padding: 4,
    marginLeft: 6,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
  },
  errorText: {
    fontSize: 12,
    color: Palette.danger,
    fontWeight: '500',
  },
});
