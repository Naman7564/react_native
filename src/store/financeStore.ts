import { storage } from '@/utils/storage';
import {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  FinanceSummaryStats,
  TimeframeFilter,
  CategoryBreakdownItem,
} from '@/types/finance';
import {
  calculateFinanceStats,
  filterTransactionsByTimeframe,
  getCategoryBreakdown,
} from '@/utils/financeCalculations';

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth();

// Seed transactions set in current month
export const INITIAL_SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'seed-tx-1',
    title: 'Amazon Shopping',
    amount: 1299,
    type: 'expense',
    category: 'Shopping',
    date: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 2), 14, 30).toISOString(),
    note: 'Office desk organizer and cables',
    createdAt: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 2), 14, 30).toISOString(),
  },
  {
    id: 'seed-tx-2',
    title: 'Fuel & Petrol',
    amount: 800,
    type: 'expense',
    category: 'Transport',
    date: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 1), 9, 15).toISOString(),
    note: 'Full tank refill at HP petrol pump',
    createdAt: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 1), 9, 15).toISOString(),
  },
  {
    id: 'seed-tx-3',
    title: 'Organic Food & Groceries',
    amount: 4250,
    type: 'expense',
    category: 'Food',
    date: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 3), 18, 0).toISOString(),
    note: 'Fresh vegetables, milk, fruits from Nature Basket',
    createdAt: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 3), 18, 0).toISOString(),
  },
  {
    id: 'seed-tx-4',
    title: 'Internet & Power Bill',
    amount: 2400,
    type: 'expense',
    category: 'Bills',
    date: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 5), 11, 20).toISOString(),
    note: 'Fiber broadband and monthly electricity bill',
    createdAt: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 5), 11, 20).toISOString(),
  },
  {
    id: 'seed-tx-5',
    title: 'Weekend Dining & Movies',
    amount: 1900,
    type: 'expense',
    category: 'Entertainment',
    date: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 4), 20, 45).toISOString(),
    note: 'Dinner with friends at Bistro',
    createdAt: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 4), 20, 45).toISOString(),
  },
  {
    id: 'seed-tx-6',
    title: 'Health Care & Pharmacy',
    amount: 1800,
    type: 'expense',
    category: 'Health',
    date: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 6), 16, 10).toISOString(),
    note: 'Annual multivitamins and checkup prescription',
    createdAt: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 6), 16, 10).toISOString(),
  },
  {
    id: 'seed-tx-7',
    title: 'Amazon Cashback',
    amount: 120,
    type: 'cashback',
    category: 'Shopping',
    date: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 2), 15, 0).toISOString(),
    note: 'Amazon Pay reward cashback',
    createdAt: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 2), 15, 0).toISOString(),
  },
  {
    id: 'seed-tx-8',
    title: 'Credit Card Reward',
    amount: 450,
    type: 'cashback',
    category: 'Credit Card',
    date: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 4), 12, 0).toISOString(),
    note: 'Monthly milestone reward points redeemed',
    createdAt: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 4), 12, 0).toISOString(),
  },
  {
    id: 'seed-tx-9',
    title: 'UPI Scratch Card Reward',
    amount: 280,
    type: 'cashback',
    category: 'UPI',
    date: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 1), 10, 30).toISOString(),
    note: 'Google Pay merchant cashback',
    createdAt: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 1), 10, 30).toISOString(),
  },
  {
    id: 'seed-tx-10',
    title: 'Freelance Project Delivery',
    amount: 5000,
    type: 'profit',
    category: 'Freelance',
    date: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 3), 17, 30).toISOString(),
    note: 'UI design and mobile component kit for client',
    createdAt: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 3), 17, 30).toISOString(),
  },
  {
    id: 'seed-tx-11',
    title: 'Consulting Honorarium',
    amount: 9200,
    type: 'profit',
    category: 'Business',
    date: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 6), 14, 0).toISOString(),
    note: 'Architecture advisory session',
    createdAt: new Date(currentYear, currentMonth, Math.max(1, now.getDate() - 6), 14, 0).toISOString(),
  },
];

type Listener = () => void;

class FinanceStore {
  private transactions: Transaction[] = INITIAL_SEED_TRANSACTIONS;
  private isLoaded: boolean = false;
  private listeners: Set<Listener> = new Set();
  private loadPromise: Promise<void> | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    if (!this.loadPromise) {
      this.loadPromise = this.loadFromStorage();
    }
    return this.loadPromise;
  }

  private async loadFromStorage() {
    try {
      const stored = await storage.getTransactions();
      if (stored && stored.length > 0) {
        this.transactions = stored;
      } else {
        // Initialize with default sample transactions on first run
        this.transactions = INITIAL_SEED_TRANSACTIONS;
        await storage.saveTransactions(this.transactions);
      }
    } catch (error) {
      console.error('[FinanceStore] Failed to load transactions:', error);
      this.transactions = INITIAL_SEED_TRANSACTIONS;
    } finally {
      this.isLoaded = true;
      this.notify();
    }
  }

  public async ensureLoaded(): Promise<void> {
    if (this.isLoaded) return;
    await this.init();
  }

  public getSnapshot(): { transactions: Transaction[]; isLoaded: boolean } {
    return {
      transactions: this.transactions,
      isLoaded: this.isLoaded,
    };
  }

  public getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  public getTransactionById(id: string): Transaction | undefined {
    return this.transactions.find((t) => t.id === id);
  }

  public getStats(timeframe?: TimeframeFilter): FinanceSummaryStats {
    const list = timeframe
      ? filterTransactionsByTimeframe(this.transactions, timeframe)
      : this.transactions;
    return calculateFinanceStats(list);
  }

  public getCurrentMonthStats(): FinanceSummaryStats {
    const list = filterTransactionsByTimeframe(this.transactions, 'month');
    return calculateFinanceStats(list);
  }

  public getCategoryBreakdown(timeframe?: TimeframeFilter): CategoryBreakdownItem[] {
    const list = timeframe
      ? filterTransactionsByTimeframe(this.transactions, timeframe)
      : this.transactions;
    return getCategoryBreakdown(list, 'expense');
  }

  public async addTransaction(input: CreateTransactionInput): Promise<Transaction> {
    await this.ensureLoaded();

    const newTx: Transaction = {
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      title: input.title.trim(),
      amount: Math.abs(input.amount),
      type: input.type,
      category: input.category.trim(),
      date: input.date,
      note: input.note?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    this.transactions = [newTx, ...this.transactions];
    this.notify();
    await storage.saveTransactions(this.transactions);
    return newTx;
  }

  public async updateTransaction(
    id: string,
    updates: UpdateTransactionInput
  ): Promise<Transaction | null> {
    await this.ensureLoaded();

    const index = this.transactions.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const current = this.transactions[index];
    const updated: Transaction = {
      ...current,
      title: updates.title !== undefined ? updates.title.trim() : current.title,
      amount: updates.amount !== undefined ? Math.abs(updates.amount) : current.amount,
      type: updates.type !== undefined ? updates.type : current.type,
      category: updates.category !== undefined ? updates.category.trim() : current.category,
      date: updates.date !== undefined ? updates.date : current.date,
      note: updates.note !== undefined ? updates.note.trim() || undefined : current.note,
    };

    this.transactions = [
      ...this.transactions.slice(0, index),
      updated,
      ...this.transactions.slice(index + 1),
    ];

    this.notify();
    await storage.saveTransactions(this.transactions);
    return updated;
  }

  public async deleteTransaction(id: string): Promise<boolean> {
    await this.ensureLoaded();

    const index = this.transactions.findIndex((t) => t.id === id);
    if (index === -1) return false;

    this.transactions = this.transactions.filter((t) => t.id !== id);
    this.notify();
    await storage.saveTransactions(this.transactions);
    return true;
  }

  public async resetToSeed(): Promise<void> {
    this.transactions = INITIAL_SEED_TRANSACTIONS;
    this.notify();
    await storage.saveTransactions(this.transactions);
  }

  public async clearAll(): Promise<void> {
    this.transactions = [];
    this.notify();
    await storage.clearTransactions();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('[FinanceStore] Listener notification error:', e);
      }
    });
  }
}

export const financeStore = new FinanceStore();
