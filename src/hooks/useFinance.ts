import { useState, useEffect, useMemo, useCallback } from 'react';
import { financeStore } from '@/store/financeStore';
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  TimeframeFilter,
  TransactionFilterType,
  TransactionSortOption,
  FinanceSummaryStats,
  CategoryBreakdownItem,
} from '@/types/finance';
import {
  calculateFinanceStats,
  filterTransactionsByTimeframe,
  getCategoryBreakdown,
} from '@/utils/financeCalculations';

export function useFinance() {
  const [snapshot, setSnapshot] = useState(() => financeStore.getSnapshot());
  const [filter, setFilter] = useState<TransactionFilterType>('all');
  const [sortOption, setSortOption] = useState<TransactionSortOption>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [timeframe, setTimeframe] = useState<TimeframeFilter>('month');

  useEffect(() => {
    financeStore.ensureLoaded();

    const unsubscribe = financeStore.subscribe(() => {
      setSnapshot(financeStore.getSnapshot());
    });

    return unsubscribe;
  }, []);

  const transactions = snapshot.transactions;
  const isLoaded = snapshot.isLoaded;

  // Counts for filter pills
  const filterCounts = useMemo(() => {
    let all = transactions.length;
    let expense = 0;
    let cashback = 0;
    let profit = 0;

    for (const t of transactions) {
      if (t.type === 'expense') expense++;
      else if (t.type === 'cashback') cashback++;
      else if (t.type === 'profit') profit++;
    }

    return { all, expense, cashback, profit };
  }, [transactions]);

  // Overall stats
  const summaryStats: FinanceSummaryStats = useMemo(() => {
    return calculateFinanceStats(transactions);
  }, [transactions]);

  // Current month stats (for the dashboard top summary cards)
  const currentMonthStats: FinanceSummaryStats = useMemo(() => {
    const monthTx = filterTransactionsByTimeframe(transactions, 'month');
    return calculateFinanceStats(monthTx);
  }, [transactions]);

  // Timeframe-specific stats (for chart comparison)
  const timeframeStats: FinanceSummaryStats = useMemo(() => {
    const list = filterTransactionsByTimeframe(transactions, timeframe);
    return calculateFinanceStats(list);
  }, [transactions, timeframe]);

  // Category breakdown for monthly expenses
  const categoryBreakdown: CategoryBreakdownItem[] = useMemo(() => {
    const monthTx = filterTransactionsByTimeframe(transactions, 'month');
    return getCategoryBreakdown(monthTx, 'expense');
  }, [transactions]);

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // 1. Type filter
    if (filter !== 'all') {
      result = result.filter((t) => t.type === filter);
    }

    // 2. Search query (title, category, note)
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((t) => {
        const titleMatch = t.title.toLowerCase().includes(q);
        const categoryMatch = t.category.toLowerCase().includes(q);
        const noteMatch = t.note?.toLowerCase().includes(q) ?? false;
        return titleMatch || categoryMatch || noteMatch;
      });
    }

    // 3. Sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();

        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();

        case 'highest':
          return b.amount - a.amount;

        case 'lowest':
          return a.amount - b.amount;

        default:
          return 0;
      }
    });

    return result;
  }, [transactions, filter, searchQuery, sortOption]);

  const addTransaction = useCallback(async (input: CreateTransactionInput) => {
    return await financeStore.addTransaction(input);
  }, []);

  const updateTransaction = useCallback(
    async (id: string, updates: UpdateTransactionInput) => {
      return await financeStore.updateTransaction(id, updates);
    },
    []
  );

  const deleteTransaction = useCallback(async (id: string) => {
    return await financeStore.deleteTransaction(id);
  }, []);

  const getTransaction = useCallback((id: string) => {
    return financeStore.getTransactionById(id);
  }, []);

  const resetToSeed = useCallback(async () => {
    await financeStore.resetToSeed();
  }, []);

  return {
    transactions,
    filteredTransactions,
    summaryStats,
    currentMonthStats,
    timeframeStats,
    categoryBreakdown,
    filterCounts,
    timeframe,
    setTimeframe,
    filter,
    setFilter,
    sortOption,
    setSortOption,
    searchQuery,
    setSearchQuery,
    isLoading: !isLoaded,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransaction,
    resetToSeed,
  };
}
