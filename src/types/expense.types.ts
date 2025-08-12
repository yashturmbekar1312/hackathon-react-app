export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  description: string;
  date: Date;
  category: TransactionCategory;
  type: TransactionType;
  source: TransactionSource;
  isRecurring: boolean;
  recurringId?: string;
  bankAccountId?: string;
  isManuallyClassified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankAccount {
  id: string;
  userId: string;
  bankName: string;
  accountNumber: string;
  accountType: AccountType;
  balance: number;
  currency: string;
  isLinked: boolean;
  lastSyncDate: Date;
  createdAt: Date;
}

export interface Budget {
  id: string;
  userId: string;
  category: TransactionCategory;
  amount: number;
  spent: number;
  month: number;
  year: number;
  alertThreshold: number; // Percentage (e.g., 80 for 80%)
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurringTransaction {
  id: string;
  userId: string;
  description: string;
  amount: number;
  category: TransactionCategory;
  frequency: RecurringFrequency;
  nextDate: Date;
  isActive: boolean;
  confidence: number; // ML confidence score
  createdAt: Date;
}

export enum TransactionCategory {
  SALARY = 'salary',
  RENT = 'rent',
  GROCERIES = 'groceries',
  UTILITIES = 'utilities',
  TRANSPORTATION = 'transportation',
  ENTERTAINMENT = 'entertainment',
  HEALTHCARE = 'healthcare',
  EDUCATION = 'education',
  SHOPPING = 'shopping',
  FOOD_DINING = 'food_dining',
  INVESTMENT = 'investment',
  SAVINGS = 'savings',
  OTHER = 'other'
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export enum TransactionSource {
  BANK_API = 'bank_api',
  CSV_IMPORT = 'csv_import',
  MANUAL = 'manual'
}

export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  CREDIT = 'credit'
}

export enum RecurringFrequency {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

export interface CSVTransactionImport {
  date: string;
  description: string;
  amount: string;
  category?: string;
}

export interface TransactionClassificationRule {
  pattern: string;
  category: TransactionCategory;
  type: TransactionType;
}
