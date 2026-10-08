import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFinance } from '@/hooks/useFinance';
import { getCategoryConfig } from '@/types/finance';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { Palette } from '@/constants/colors';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { formatRupees } from '@/utils/financeCalculations';
import { formatDisplayDate } from '@/utils/date';

export default function TransactionDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTransaction, deleteTransaction } = useFinance();

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const transaction = id ? getTransaction(id) : undefined;

  if (!transaction) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Palette.danger} />
          <Text style={styles.notFoundTitle}>Transaction Not Found</Text>
          <Text style={styles.notFoundSubtitle}>
            This transaction may have been removed or does not exist.
          </Text>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Return to Finance</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const { title, amount, type, category, date, note, createdAt } = transaction;
  const config = getCategoryConfig(category, type);
  const formattedDate = formatDisplayDate(date);
  const fullDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const createdDateStr = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isExpense = type === 'expense';
  const isCashback = type === 'cashback';

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await deleteTransaction(transaction.id);
      setIsDeleteModalVisible(false);
      router.back();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    router.push({
      pathname: '/finance/edit-transaction',
      params: { id: transaction.id },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.headerButton}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={24} color={Palette.light.text} />
        </Pressable>

        <Text style={styles.headerTitle}>Transaction Details</Text>

        <Pressable
          onPress={handleEdit}
          style={styles.headerEditButton}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Edit transaction"
        >
          <Ionicons name="pencil-outline" size={20} color={Palette.primary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Amount Card */}
        <View style={styles.heroCard}>
          <View
            style={[
              styles.heroIconBadge,
              { backgroundColor: config.color + '18' },
            ]}
          >
            <Ionicons
              name={config.icon as keyof typeof Ionicons.glyphMap}
              size={28}
              color={config.color}
            />
          </View>

          <Text
            style={[
              styles.heroAmount,
              isExpense
                ? styles.amountExpense
                : isCashback
                ? styles.amountCashback
                : styles.amountProfit,
            ]}
          >
            {formatRupees(amount, { type })}
          </Text>

          <View
            style={[
              styles.heroTypeBadge,
              isExpense
                ? styles.heroTypeExpense
                : isCashback
                ? styles.heroTypeCashback
                : styles.heroTypeProfit,
            ]}
          >
            <Text
              style={[
                styles.heroTypeText,
                isExpense
                  ? styles.typeTextExpense
                  : isCashback
                  ? styles.typeTextCashback
                  : styles.typeTextProfit,
              ]}
            >
              {isExpense ? 'Expense Outflow' : isCashback ? 'Cashback Reward' : 'Profit & Income'}
            </Text>
          </View>
        </View>

        {/* Details Table Card */}
        <View style={styles.detailsCard}>
          {/* Title Row */}
          <View style={styles.detailRow}>
            <View style={styles.detailLabelGroup}>
              <Ionicons name="document-text-outline" size={18} color={Palette.light.textMuted} />
              <Text style={styles.detailLabel}>Title</Text>
            </View>
            <Text style={styles.detailValue}>{title}</Text>
          </View>

          <View style={styles.rowDivider} />

          {/* Category Row */}
          <View style={styles.detailRow}>
            <View style={styles.detailLabelGroup}>
              <Ionicons name="pricetag-outline" size={18} color={Palette.light.textMuted} />
              <Text style={styles.detailLabel}>Category</Text>
            </View>
            <View style={styles.categoryPill}>
              <View style={[styles.catMiniDot, { backgroundColor: config.color }]} />
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          {/* Date Row */}
          <View style={styles.detailRow}>
            <View style={styles.detailLabelGroup}>
              <Ionicons name="calendar-outline" size={18} color={Palette.light.textMuted} />
              <Text style={styles.detailLabel}>Date</Text>
            </View>
            <View style={styles.dateRight}>
              <Text style={styles.detailValue}>{formattedDate}</Text>
              <Text style={styles.dateSubtext}>{fullDate}</Text>
            </View>
          </View>

          {/* Note Row (if present) */}
          {note ? (
            <>
              <View style={styles.rowDivider} />
              <View style={styles.detailRow}>
                <View style={styles.detailLabelGroup}>
                  <Ionicons name="chatbubble-outline" size={18} color={Palette.light.textMuted} />
                  <Text style={styles.detailLabel}>Note</Text>
                </View>
                <Text style={[styles.detailValue, styles.noteValue]}>{note}</Text>
              </View>
            </>
          ) : null}

          <View style={styles.rowDivider} />

          {/* Created At Row */}
          <View style={styles.detailRow}>
            <View style={styles.detailLabelGroup}>
              <Ionicons name="time-outline" size={18} color={Palette.light.textMuted} />
              <Text style={styles.detailLabel}>Created</Text>
            </View>
            <Text style={styles.createdDateText}>{createdDateStr}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.editActionButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleEdit}
            accessibilityRole="button"
            accessibilityLabel="Edit transaction"
          >
            <Ionicons name="create-outline" size={18} color={Palette.primary} />
            <Text style={styles.editActionText}>Edit Transaction</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.deleteActionButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => setIsDeleteModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Delete transaction"
          >
            <Ionicons name="trash-outline" size={18} color={Palette.danger} />
            <Text style={styles.deleteActionText}>Delete Transaction</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={isDeleteModalVisible}
        title="Delete Transaction?"
        message={`Are you sure you want to delete "${title}" (${formatRupees(amount, { type })})? This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.light.background,
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
  headerEditButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: 40,
    gap: 16,
  },
  heroCard: {
    backgroundColor: Palette.light.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.light.cardBorder,
    ...Shadows.card,
  },
  heroIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: 8,
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
  heroTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  heroTypeExpense: {
    backgroundColor: '#FEF2F2',
  },
  heroTypeCashback: {
    backgroundColor: '#FFFBEB',
  },
  heroTypeProfit: {
    backgroundColor: '#ECFDF5',
  },
  heroTypeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
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
  detailsCard: {
    backgroundColor: Palette.light.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.light.cardBorder,
    ...Shadows.subtle,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 12,
  },
  detailLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: Palette.light.textMuted,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.light.text,
    textAlign: 'right',
    flexShrink: 1,
  },
  noteValue: {
    color: Palette.light.textSecondary,
    fontStyle: 'italic',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.light.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  catMiniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.light.textSecondary,
  },
  dateRight: {
    alignItems: 'flex-end',
  },
  dateSubtext: {
    fontSize: 11,
    color: Palette.light.textMuted,
    marginTop: 2,
  },
  createdDateText: {
    fontSize: 12,
    color: Palette.light.textMuted,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Palette.light.surfaceSubtle,
  },
  actionsContainer: {
    gap: 10,
    marginTop: Spacing.sm,
  },
  editActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Palette.primaryLight,
    paddingVertical: 14,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  editActionText: {
    color: Palette.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  deleteActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteActionText: {
    color: Palette.danger,
    fontSize: 15,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
    gap: 12,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.light.text,
  },
  notFoundSubtitle: {
    fontSize: 14,
    color: Palette.light.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  backButton: {
    marginTop: Spacing.md,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.full,
    backgroundColor: Palette.primary,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
