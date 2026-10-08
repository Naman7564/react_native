export type TransactionType = 'expense' | 'cashback' | 'profit';

export interface Transaction {
  id: string;
  title: string;
  amount: number; // Stored as positive number in rupees
  type: TransactionType;
  category: string;
  date: string; // ISO date string or YYYY-MM-DD
  note?: string;
  createdAt: string; // ISO timestamp
}

export type TimeframeFilter = 'week' | 'month' | 'year';

export type TransactionFilterType = 'all' | 'expense' | 'cashback' | 'profit';

export type TransactionSortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

export interface FinanceSummaryStats {
  totalExpenses: number;
  totalCashback: number;
  totalProfit: number;
  net: number;
}

export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
  count: number;
}

export interface CreateTransactionInput {
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  note?: string;
}

export interface UpdateTransactionInput {
  title?: string;
  amount?: number;
  type?: TransactionType;
  category?: string;
  date?: string;
  note?: string;
}

export interface CategoryConfig {
  id: string;
  label: string;
  icon: string;
  color: string;
  bg: string;
}

export const EXPENSE_CATEGORIES: CategoryConfig[] = [
  { id: 'Food', label: 'Food', icon: 'restaurant-outline', color: '#F59E0B', bg: '#FEF3C7' },
  { id: 'Shopping', label: 'Shopping', icon: 'cart-outline', color: '#EC4899', bg: '#FCE7F3' },
  { id: 'Transport', label: 'Transport', icon: 'car-outline', color: '#3B82F6', bg: '#DBEAFE' },
  { id: 'Bills', label: 'Bills', icon: 'receipt-outline', color: '#6366F1', bg: '#EEF2FF' },
  { id: 'Entertainment', label: 'Entertainment', icon: 'film-outline', color: '#8B5CF6', bg: '#EDE9FE' },
  { id: 'Health', label: 'Health', icon: 'fitness-outline', color: '#10B981', bg: '#D1FAE5' },
  { id: 'Education', label: 'Education', icon: 'school-outline', color: '#06B6D4', bg: '#CFFAFE' },
  { id: 'Travel', label: 'Travel', icon: 'airplane-outline', color: '#14B8A6', bg: '#CCFBF1' },
  { id: 'Other', label: 'Other', icon: 'grid-outline', color: '#64748B', bg: '#F1F5F9' },
];

export const CASHBACK_CATEGORIES: CategoryConfig[] = [
  { id: 'Shopping', label: 'Shopping', icon: 'pricetag-outline', color: '#EC4899', bg: '#FCE7F3' },
  { id: 'Credit Card', label: 'Credit Card', icon: 'card-outline', color: '#4F46E5', bg: '#EEF2FF' },
  { id: 'UPI', label: 'UPI', icon: 'flash-outline', color: '#10B981', bg: '#D1FAE5' },
  { id: 'Offers', label: 'Offers', icon: 'gift-outline', color: '#F59E0B', bg: '#FEF3C7' },
  { id: 'Other', label: 'Other', icon: 'grid-outline', color: '#64748B', bg: '#F1F5F9' },
];

export const PROFIT_CATEGORIES: CategoryConfig[] = [
  { id: 'Salary', label: 'Salary', icon: 'cash-outline', color: '#10B981', bg: '#D1FAE5' },
  { id: 'Freelance', label: 'Freelance', icon: 'laptop-outline', color: '#6366F1', bg: '#EEF2FF' },
  { id: 'Business', label: 'Business', icon: 'trending-up-outline', color: '#059669', bg: '#A7F3D0' },
  { id: 'Investment', label: 'Investment', icon: 'pie-chart-outline', color: '#2563EB', bg: '#DBEAFE' },
  { id: 'Other', label: 'Other', icon: 'grid-outline', color: '#64748B', bg: '#F1F5F9' },
];

export function getCategoriesForType(type: TransactionType): CategoryConfig[] {
  switch (type) {
    case 'expense':
      return EXPENSE_CATEGORIES;
    case 'cashback':
      return CASHBACK_CATEGORIES;
    case 'profit':
      return PROFIT_CATEGORIES;
  }
}

export function getCategoryConfig(category: string, type?: TransactionType): CategoryConfig {
  const allConfigs = [...EXPENSE_CATEGORIES, ...CASHBACK_CATEGORIES, ...PROFIT_CATEGORIES];
  const found = allConfigs.find((c) => c.label.toLowerCase() === category.toLowerCase());
  if (found) return found;
  return {
    id: category,
    label: category,
    icon: 'grid-outline',
    color: '#64748B',
    bg: '#F1F5F9',
  };
}
