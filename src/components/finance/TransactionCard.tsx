import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction, getCategoryConfig } from '@/types/finance';
import { Palette } from '@/constants/colors';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { formatRupees } from '@/utils/financeCalculations';
import { formatDisplayDate } from '@/utils/date';

interface TransactionCardProps {
  transaction: Transaction;
  onPress: (id: string) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onPress,
}) => {
  const { id, title, amount, type, category, date, note } = transaction;
  const config = getCategoryConfig(category, type);
  const formattedDate = formatDisplayDate(date);

  const isExpense = type === 'expense';
  const isCashback = type === 'cashback';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPress(id)}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${formatRupees(amount, { type })}, ${category}`}
    >
      {/* Category Icon Badge */}
      <View
        style={[
          styles.iconBadge,
          { backgroundColor: config.color + '15' },
        ]}
      >
        <Ionicons
          name={config.icon as keyof typeof Ionicons.glyphMap}
          size={18}
          color={config.color}
        />
      </View>

      {/* Main Content Area */}
      <View style={styles.contentArea}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>

          {/* Amount Display */}
          <Text
            style={[
              styles.amount,
              isExpense
                ? styles.amountExpense
                : isCashback
                ? styles.amountCashback
                : styles.amountProfit,
            ]}
          >
            {formatRupees(amount, { type })}
          </Text>
        </View>

        {/* Subline with Category, Date, and Type badge */}
        <View style={styles.bottomRow}>
          <View style={styles.metaRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
            <Text style={styles.dotSeparator}>•</Text>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>

          <View
            style={[
              styles.typeBadge,
              isExpense
                ? styles.typeBadgeExpense
                : isCashback
                ? styles.typeBadgeCashback
                : styles.typeBadgeProfit,
            ]}
          >
            <Text
              style={[
                styles.typeBadgeText,
                isExpense
                  ? styles.typeTextExpense
                  : isCashback
                  ? styles.typeTextCashback
                  : styles.typeTextProfit,
              ]}
            >
              {isExpense ? 'Expense' : isCashback ? 'Cashback' : 'Profit'}
            </Text>
          </View>
        </View>

        {/* Note preview if available */}
        {note ? (
          <View style={styles.noteRow}>
            <Ionicons
              name="chatbubble-outline"
              size={11}
              color={Palette.light.textPlaceholder}
            />
            <Text style={styles.noteText} numberOfLines={1}>
              {note}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.light.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.light.cardBorder,
    marginBottom: Spacing.sm,
    gap: 12,
    ...Shadows.subtle,
  },
  cardPressed: {
    backgroundColor: Palette.light.surfaceSubtle,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentArea: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Palette.light.text,
    letterSpacing: -0.2,
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  amountExpense: {
    color: Palette.light.text,
  },
  amountCashback: {
    color: '#D97706',
  },
  amountProfit: {
    color: Palette.success,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryPill: {
    backgroundColor: Palette.light.surfaceSubtle,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.light.textSecondary,
  },
  dotSeparator: {
    fontSize: 11,
    color: Palette.light.textPlaceholder,
  },
  dateText: {
    fontSize: 12,
    color: Palette.light.textMuted,
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  typeBadgeExpense: {
    backgroundColor: '#FEF2F2',
  },
  typeBadgeCashback: {
    backgroundColor: '#FFFBEB',
  },
  typeBadgeProfit: {
    backgroundColor: '#ECFDF5',
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  typeTextExpense: {
    color: Palette.danger,
  },
  typeTextCashback: {
    color: '#D97706',
  },
  typeTextProfit: {
    color: Palette.success,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  noteText: {
    fontSize: 11,
    color: Palette.light.textPlaceholder,
    flex: 1,
  },
});
