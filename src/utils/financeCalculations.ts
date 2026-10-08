import {
  Transaction,
  FinanceSummaryStats,
  TimeframeFilter,
  CategoryBreakdownItem,
  getCategoryConfig,
  TransactionType,
} from '@/types/finance';

/**
 * Formats a numeric value into Indian Rupee format (e.g. ₹1,299 or -₹1,299 or +₹120).
 */
export function formatRupees(
  amount: number,
  options?: {
    showSign?: boolean;
    type?: TransactionType;
    absolute?: boolean;
  }
): string {
  const { showSign = false, type, absolute = false } = options || {};
  const val = absolute ? Math.abs(amount) : amount;
  const formattedNumber = Math.abs(val).toLocaleString('en-IN');

  if (type === 'expense') {
    return `-₹${formattedNumber}`;
  }

  if (type === 'cashback' || type === 'profit') {
    return `+₹${formattedNumber}`;
  }

  if (showSign) {
    if (amount > 0) return `+₹${formattedNumber}`;
    if (amount < 0) return `-₹${formattedNumber}`;
    return `₹${formattedNumber}`;
  }

  return `₹${formattedNumber}`;
}

/**
 * Calculates Total Expenses, Total Cashback, Total Profit, and Net for given transactions.
 * Net = Total Profit + Total Cashback - Total Expenses
 */
export function calculateFinanceStats(transactions: Transaction[]): FinanceSummaryStats {
  let totalExpenses = 0;
  let totalCashback = 0;
  let totalProfit = 0;

  for (const t of transactions) {
    if (t.type === 'expense') {
      totalExpenses += t.amount;
    } else if (t.type === 'cashback') {
      totalCashback += t.amount;
    } else if (t.type === 'profit') {
      totalProfit += t.amount;
    }
  }

  const net = totalProfit + totalCashback - totalExpenses;

  return {
    totalExpenses,
    totalCashback,
    totalProfit,
    net,
  };
}

/**
 * Filters transactions by selected timeframe (Week, Month, Year).
 */
export function filterTransactionsByTimeframe(
  transactions: Transaction[],
  timeframe: TimeframeFilter
): Transaction[] {
  const now = new Date();

  return transactions.filter((t) => {
    const d = new Date(t.date);
    if (isNaN(d.getTime())) return false;

    if (timeframe === 'week') {
      // Last 7 days
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d >= sevenDaysAgo && d <= now;
    }

    if (timeframe === 'month') {
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }

    if (timeframe === 'year') {
      return d.getFullYear() === now.getFullYear();
    }

    return true;
  });
}

/**
 * Computes category breakdown for expenses (or specified type).
 */
export function getCategoryBreakdown(
  transactions: Transaction[],
  type: TransactionType = 'expense'
): CategoryBreakdownItem[] {
  const relevant = transactions.filter((t) => t.type === type);
  const totalAmount = relevant.reduce((sum, t) => sum + t.amount, 0);

  const categoryMap = new Map<string, { amount: number; count: number }>();

  for (const t of relevant) {
    const existing = categoryMap.get(t.category) || { amount: 0, count: 0 };
    categoryMap.set(t.category, {
      amount: existing.amount + t.amount,
      count: existing.count + 1,
    });
  }

  const breakdown: CategoryBreakdownItem[] = [];

  categoryMap.forEach((val, category) => {
    const config = getCategoryConfig(category, type);
    const percentage = totalAmount > 0 ? (val.amount / totalAmount) * 100 : 0;
    breakdown.push({
      category,
      amount: val.amount,
      percentage: Math.round(percentage),
      color: config.color,
      icon: config.icon,
      count: val.count,
    });
  });

  // Sort descending by amount
  return breakdown.sort((a, b) => b.amount - a.amount);
}

/**
 * Returns current month display label e.g. "October 2026"
 */
export function getCurrentMonthLabel(): string {
  return new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}
