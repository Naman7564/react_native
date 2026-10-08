import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFinance } from '@/hooks/useFinance';
import {
  TransactionType,
  getCategoriesForType,
  CategoryConfig,
} from '@/types/finance';
import { DatePickerModal } from '@/components/DatePickerModal';
import { Palette } from '@/constants/colors';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { formatDisplayDate } from '@/utils/date';

const TRANSACTION_TYPES: {
  id: TransactionType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    id: 'expense',
    label: 'Expense',
    icon: 'arrow-up-circle-outline',
    color: Palette.danger,
    bg: '#FEF2F2',
    border: '#FECACA',
  },
  {
    id: 'cashback',
    label: 'Cashback',
    icon: 'sparkles-outline',
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
  },
  {
    id: 'profit',
    label: 'Profit',
    icon: 'trending-up-outline',
    color: Palette.success,
    bg: '#ECFDF5',
    border: '#A7F3D0',
  },
];

export default function AddTransactionScreen() {
  const router = useRouter();
  const { addTransaction } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Food');
  const [date, setDate] = useState<string>(new Date().toISOString());
  const [note, setNote] = useState('');

  const [titleError, setTitleError] = useState<string | undefined>(undefined);
  const [amountError, setAmountError] = useState<string | undefined>(undefined);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = getCategoriesForType(type);

  // When changing type, set default category to first in that list
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const newCategories = getCategoriesForType(newType);
    setSelectedCategory(newCategories[0].id);
  };

  const handleSave = async () => {
    let hasError = false;

    if (!title.trim()) {
      setTitleError('Title is required');
      hasError = true;
    }

    const numericAmount = parseFloat(amount.replace(/,/g, ''));
    if (!amount.trim() || isNaN(numericAmount) || numericAmount <= 0) {
      setAmountError('Enter a valid amount greater than ₹0');
      hasError = true;
    }

    if (hasError) return;

    try {
      setIsSubmitting(true);
      await addTransaction({
        title: title.trim(),
        amount: numericAmount,
        type,
        category: selectedCategory,
        date: date || new Date().toISOString(),
        note: note.trim() || undefined,
      });
      router.back();
    } catch (error) {
      console.error('Failed to create transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = formatDisplayDate(date);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Navigation Bar Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.headerButton}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Ionicons name="close" size={24} color={Palette.light.text} />
          </Pressable>

          <Text style={styles.headerTitle}>New Transaction</Text>

          <Pressable
            onPress={handleSave}
            disabled={!title.trim() || !amount.trim() || isSubmitting}
            style={[
              styles.headerSaveButton,
              (!title.trim() || !amount.trim() || isSubmitting) && styles.headerSaveDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Save transaction"
          >
            <Text
              style={[
                styles.headerSaveText,
                (!title.trim() || !amount.trim() || isSubmitting) && styles.headerSaveTextDisabled,
              ]}
            >
              Save
            </Text>
          </Pressable>
        </View>

        {/* Form Body */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Type Segmented Control */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Transaction Type</Text>
            <View style={styles.typeRow}>
              {TRANSACTION_TYPES.map((t) => {
                const isSelected = type === t.id;
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => handleTypeChange(t.id)}
                    style={[
                      styles.typeOption,
                      isSelected && {
                        backgroundColor: t.bg,
                        borderColor: t.border,
                      },
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Ionicons
                      name={t.icon}
                      size={18}
                      color={isSelected ? t.color : Palette.light.textMuted}
                    />
                    <Text
                      style={[
                        styles.typeText,
                        isSelected && { color: t.color, fontWeight: '700' },
                      ]}
                    >
                      {t.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Amount Input Card */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Amount (₹)</Text>
            <View
              style={[
                styles.amountInputContainer,
                amountError ? styles.inputErrorBorder : null,
              ]}
            >
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                placeholderTextColor={Palette.light.textPlaceholder}
                value={amount}
                onChangeText={(text) => {
                  // Allow numbers and decimal point only
                  const sanitized = text.replace(/[^0-9.]/g, '');
                  setAmount(sanitized);
                  if (amountError) setAmountError(undefined);
                }}
                keyboardType="numeric"
                autoFocus
              />
            </View>
            {amountError && <Text style={styles.errorText}>{amountError}</Text>}
          </View>

          {/* Title Input */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Title</Text>
            <View
              style={[
                styles.textInputContainer,
                titleError ? styles.inputErrorBorder : null,
              ]}
            >
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Amazon Shopping, Fuel, Freelance..."
                placeholderTextColor={Palette.light.textPlaceholder}
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  if (titleError) setTitleError(undefined);
                }}
                maxLength={60}
              />
            </View>
            {titleError && <Text style={styles.errorText}>{titleError}</Text>}
          </View>

          {/* Category Selection Chips */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Category</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat: CategoryConfig) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
                    style={[
                      styles.categoryChip,
                      isSelected && {
                        backgroundColor: cat.bg,
                        borderColor: cat.color,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Ionicons
                      name={cat.icon as keyof typeof Ionicons.glyphMap}
                      size={16}
                      color={isSelected ? cat.color : Palette.light.textMuted}
                    />
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected && { color: cat.color, fontWeight: '700' },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Date Selector */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Date</Text>
            <Pressable
              style={styles.dateButton}
              onPress={() => setIsDatePickerVisible(true)}
              accessibilityRole="button"
            >
              <View style={styles.dateLeft}>
                <View style={styles.calendarIconCircle}>
                  <Ionicons name="calendar-outline" size={18} color={Palette.primary} />
                </View>
                <Text style={styles.dateText}>{formattedDate || 'Today'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Palette.light.textPlaceholder} />
            </Pressable>
          </View>

          {/* Optional Note */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Note (Optional)</Text>
            <View style={[styles.textInputContainer, styles.noteContainer]}>
              <TextInput
                style={[styles.textInput, styles.noteInput]}
                placeholder="Add receipt notes, payment mode, or details..."
                placeholderTextColor={Palette.light.textPlaceholder}
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>
          </View>
        </ScrollView>

        {/* Bottom CTA Bar */}
        <View style={styles.bottomBar}>
          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              (!title.trim() || !amount.trim() || isSubmitting) && styles.submitButtonDisabled,
              pressed && styles.submitButtonPressed,
            ]}
            onPress={handleSave}
            disabled={!title.trim() || !amount.trim() || isSubmitting}
          >
            <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Adding...' : 'Add Transaction'}
            </Text>
          </Pressable>
        </View>

        {/* Date Picker Modal */}
        <DatePickerModal
          visible={isDatePickerVisible}
          selectedDate={date}
          onSelectDate={(newDate) => {
            if (newDate) setDate(newDate);
          }}
          onClose={() => setIsDatePickerVisible(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.light.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Palette.light.cardBorder,
    backgroundColor: Palette.light.card,
  },
  headerButton: {
    padding: 6,
    borderRadius: BorderRadius.full,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.light.text,
  },
  headerSaveButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: Palette.primary,
  },
  headerSaveDisabled: {
    backgroundColor: Palette.light.surfaceSubtle,
  },
  headerSaveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSaveTextDisabled: {
    color: Palette.light.textPlaceholder,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  sectionContainer: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.light.text,
    marginBottom: Spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Palette.light.cardBorder,
    backgroundColor: Palette.light.card,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.light.textSecondary,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.light.card,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Palette.light.cardBorder,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    ...Shadows.subtle,
  },
  currencySymbol: {
    fontSize: 26,
    fontWeight: '800',
    color: Palette.primary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 26,
    fontWeight: '800',
    color: Palette.light.text,
    padding: 0,
  },
  textInputContainer: {
    backgroundColor: Palette.light.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Palette.light.cardBorder,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  textInput: {
    fontSize: 15,
    color: Palette.light.text,
    padding: 0,
  },
  noteContainer: {
    minHeight: 80,
  },
  noteInput: {
    textAlignVertical: 'top',
  },
  inputErrorBorder: {
    borderColor: Palette.danger,
  },
  errorText: {
    fontSize: 12,
    color: Palette.danger,
    marginTop: 4,
    fontWeight: '500',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Palette.light.cardBorder,
    backgroundColor: Palette.light.card,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.light.textSecondary,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Palette.light.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Palette.light.cardBorder,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  dateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  calendarIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.light.text,
  },
  bottomBar: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Palette.light.card,
    borderTopWidth: 1,
    borderTopColor: Palette.light.cardBorder,
    ...Shadows.subtle,
  },
  submitButton: {
    backgroundColor: Palette.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.xl,
    ...Shadows.card,
  },
  submitButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonPressed: {
    opacity: 0.9,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
