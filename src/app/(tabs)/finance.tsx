import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFinance } from '@/hooks/useFinance';
import { FinanceSummary } from '@/components/finance/FinanceSummary';
import { TransactionFilters } from '@/components/finance/TransactionFilters';
import { TransactionCard } from '@/components/finance/TransactionCard';
import { Palette } from '@/constants/colors';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { getCurrentMonthLabel } from '@/utils/financeCalculations';

export default function FinanceScreen() {
  const router = useRouter();
  const {
    filteredTransactions,
    currentMonthStats,
    filterCounts,
    filter,
    setFilter,
    sortOption,
    setSortOption,
    searchQuery,
    setSearchQuery,
    isLoading,
    resetToSeed,
  } = useFinance();

  const [refreshing, setRefreshing] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);

  const currentMonth = getCurrentMonthLabel();

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 400);
  };

  const handlePressTransaction = (id: string) => {
    router.push({
      pathname: '/finance/transaction-details',
      params: { id },
    });
  };

  const handleOpenAdd = () => {
    router.push('/finance/add-transaction');
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.monthLabel}>{currentMonth}</Text>
          <Text style={styles.title}>Finance</Text>
        </View>

        <View style={styles.headerRightActions}>
          <Pressable
            style={styles.settingsButton}
            onPress={() => setIsSettingsModalVisible(true)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Finance settings and actions"
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={Palette.light.text} />
          </Pressable>
        </View>
      </View>

      {/* Summary Cards (Expenses, Cashback, Profit, Net) */}
      <FinanceSummary stats={currentMonthStats} />

      {/* Transaction Filters, Search & Sort */}
      <TransactionFilters
        currentFilter={filter}
        onSelectFilter={setFilter}
        currentSort={sortOption}
        onSelectSort={setSortOption}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        counts={filterCounts}
      />

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {filter === 'all'
            ? 'Recent Transactions'
            : filter === 'expense'
            ? 'Expenses'
            : filter === 'cashback'
            ? 'Cashback Rewards'
            : 'Profits & Earnings'}
        </Text>
        <Text style={styles.sectionCountBadge}>
          {filteredTransactions.length}{' '}
          {filteredTransactions.length === 1 ? 'record' : 'records'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionCard
            transaction={item}
            onPress={handlePressTransaction}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBadge}>
                <Ionicons
                  name={searchQuery ? 'search-outline' : 'receipt-outline'}
                  size={32}
                  color={Palette.primary}
                />
              </View>
              <Text style={styles.emptyTitle}>
                {searchQuery
                  ? 'No matching transactions'
                  : 'No transactions yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? `No records found matching "${searchQuery}".`
                  : 'Track your expenses, cashback, and profits by adding your first record.'}
              </Text>
              <Pressable
                style={styles.emptyAddButton}
                onPress={() => {
                  if (searchQuery) {
                    setSearchQuery('');
                  } else {
                    handleOpenAdd();
                  }
                }}
              >
                <Ionicons
                  name={searchQuery ? 'close-circle-outline' : 'add-circle-outline'}
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.emptyAddText}>
                  {searchQuery ? 'Clear Search' : 'Add Transaction'}
                </Text>
              </Pressable>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Palette.primary}
            colors={[Palette.primary]}
          />
        }
      />

      {/* Prominent Floating Add Transaction Button */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed,
        ]}
        onPress={handleOpenAdd}
        accessibilityRole="button"
        accessibilityLabel="Add transaction"
      >
        <Ionicons name="add" size={26} color="#FFFFFF" />
      </Pressable>

      {/* Settings / Actions Bottom Modal */}
      <Modal
        visible={isSettingsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSettingsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsSettingsModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Finance Actions</Text>
                  <Pressable
                    onPress={() => setIsSettingsModalVisible(false)}
                    hitSlop={10}
                    style={styles.closeBtn}
                  >
                    <Ionicons name="close" size={20} color={Palette.light.textMuted} />
                  </Pressable>
                </View>

                {/* Info Card */}
                <View style={styles.infoBox}>
                  <Ionicons name="shield-checkmark" size={18} color={Palette.primary} />
                  <Text style={styles.infoText}>
                    Personal finance tracker only. All data is saved privately on your device.
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <Pressable
                    style={styles.actionRow}
                    onPress={async () => {
                      await resetToSeed();
                      setIsSettingsModalVisible(false);
                    }}
                  >
                    <View style={styles.actionRowLeft}>
                      <Ionicons name="refresh-outline" size={20} color={Palette.primary} />
                      <Text style={styles.actionRowText}>Reset to Sample Data</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={Palette.light.textPlaceholder} />
                  </Pressable>

                  <Pressable
                    style={styles.actionRow}
                    onPress={() => {
                      setIsSettingsModalVisible(false);
                      handleOpenAdd();
                    }}
                  >
                    <View style={styles.actionRowLeft}>
                      <Ionicons name="add-circle-outline" size={20} color={Palette.success} />
                      <Text style={styles.actionRowText}>New Transaction</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={Palette.light.textPlaceholder} />
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.light.background,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 100, // Room for FAB
  },
  listHeader: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  monthLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.light.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Palette.light.text,
    letterSpacing: -0.6,
    marginTop: 2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: Palette.light.card,
    borderWidth: 1,
    borderColor: Palette.light.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.light.text,
    letterSpacing: -0.2,
  },
  sectionCountBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.light.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
    gap: 8,
  },
  emptyIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.light.text,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Palette.light.textMuted,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    lineHeight: 18,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
    ...Shadows.subtle,
  },
  emptyAddText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.floating,
  },
  fabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Palette.light.card,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    borderWidth: 1,
    borderColor: Palette.light.cardBorder,
    ...Shadows.modal,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.light.text,
  },
  closeBtn: {
    padding: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Palette.primaryLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    marginBottom: Spacing.lg,
  },
  infoText: {
    fontSize: 12,
    color: Palette.primary,
    fontWeight: '500',
    flex: 1,
    lineHeight: 16,
  },
  modalActions: {
    gap: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Palette.light.surfaceSubtle,
    borderWidth: 1,
    borderColor: Palette.light.cardBorder,
  },
  actionRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionRowText: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.light.text,
  },
});
