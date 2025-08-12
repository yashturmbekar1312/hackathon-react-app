/**
 * Financial Data Types
 * All types related to accounts, transactions, budgets, and analytics
 */

import { ApiResponse, TransactionType, AccountType, BudgetPeriod, GoalType } from './api.types';

// Account Types
export interface Account {
  id: string;
  accountName: string;
  accountType: AccountType;
  bankName: string;
  accountNumber?: string;
  routingNumber?: string;
  balance: number;
  currency: string;
  isActive: boolean;
  isPrimary: boolean;
  description?: string;
  interestRate?: number;
  creditLimit?: number;
  minimumBalance?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountRequest {
  accountName: string;
  accountType: AccountType;
  bankName: string;
  accountNumber: string;
  routingNumber?: string;
  balance: number;
  currency: string;
  description?: string;
  interestRate?: number;
  creditLimit?: number;
  minimumBalance?: number;
}

export interface UpdateAccountRequest {
  accountName?: string;
  accountType?: AccountType;
  bankName?: string;
  balance?: number;
  description?: string;
  interestRate?: number;
  creditLimit?: number;
  minimumBalance?: number;
  isActive?: boolean;
  isPrimary?: boolean;
}

export interface AccountBalanceHistory {
  date: string;
  balance: number;
  change: number;
  changeType: 'credit' | 'debit';
  description: string;
}

// Transaction Types
export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  type: TransactionType;
  category: string;
  subcategory?: string;
  description: string;
  merchant?: string;
  location?: string;
  transactionDate: string;
  postedDate?: string;
  tags: string[];
  isRecurring: boolean;
  recurringId?: string;
  receiptUrl?: string;
  notes?: string;
  isReviewed: boolean;
  createdAt: string;
  updatedAt: string;
  account?: Account;
}

export interface CreateTransactionRequest {
  accountId: string;
  amount: number;
  type: TransactionType;
  category: string;
  subcategory?: string;
  description: string;
  merchant?: string;
  location?: string;
  transactionDate: string;
  tags?: string[];
  notes?: string;
  receiptFile?: File;
}

export interface UpdateTransactionRequest {
  amount?: number;
  category?: string;
  subcategory?: string;
  description?: string;
  merchant?: string;
  location?: string;
  transactionDate?: string;
  tags?: string[];
  notes?: string;
  isReviewed?: boolean;
}

export interface BulkTransactionRequest {
  transactions: CreateTransactionRequest[];
}

export interface TransactionFilters {
  page?: number;
  pageSize?: number;
  accountId?: string;
  type?: TransactionType;
  category?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  merchant?: string;
  search?: string;
  tags?: string[];
  isRecurring?: boolean;
  sortBy?: 'date' | 'amount' | 'merchant';
  sortOrder?: 'asc' | 'desc';
}

export interface TransactionCategory {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  subcategories: string[];
  isDefault: boolean;
  isActive: boolean;
}

// Budget Types
export interface Budget {
  id: string;
  name: string;
  description?: string;
  category: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  progress: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  alertThreshold: number;
  isActive: boolean;
  isExceeded: boolean;
  accounts: string[];
  excludeAccounts: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetRequest {
  name: string;
  description?: string;
  category: string;
  budgetAmount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  alertThreshold: number;
  accounts?: string[];
  excludeAccounts?: string[];
  tags?: string[];
}

export interface UpdateBudgetRequest {
  name?: string;
  description?: string;
  category?: string;
  budgetAmount?: number;
  period?: BudgetPeriod;
  startDate?: string;
  endDate?: string;
  alertThreshold?: number;
  isActive?: boolean;
  accounts?: string[];
  excludeAccounts?: string[];
  tags?: string[];
}

export interface BudgetProgress {
  budgetId: string;
  period: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  progress: number;
  isOverBudget: boolean;
  daysRemaining: number;
  averageDailySpending: number;
  projectedSpending: number;
  variance: number;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export interface BudgetAlert {
  id: string;
  budgetId: string;
  type: 'threshold' | 'exceeded' | 'milestone';
  message: string;
  threshold: number;
  currentAmount: number;
  isRead: boolean;
  createdAt: string;
}

// Goal Types
export interface Goal {
  id: string;
  name: string;
  description?: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  progress: number;
  targetDate: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  linkedAccountId?: string;
  autoContribution?: {
    enabled: boolean;
    amount: number;
    frequency: 'weekly' | 'monthly' | 'quarterly';
  };
  milestones: GoalMilestone[];
  createdAt: string;
  updatedAt: string;
}

export interface GoalMilestone {
  id: string;
  amount: number;
  description: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface CreateGoalRequest {
  name: string;
  description?: string;
  type: GoalType;
  targetAmount: number;
  targetDate: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  linkedAccountId?: string;
  autoContribution?: {
    enabled: boolean;
    amount: number;
    frequency: 'weekly' | 'monthly' | 'quarterly';
  };
}

export interface UpdateGoalRequest {
  name?: string;
  description?: string;
  targetAmount?: number;
  targetDate?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  linkedAccountId?: string;
  autoContribution?: {
    enabled: boolean;
    amount: number;
    frequency: 'weekly' | 'monthly' | 'quarterly';
  };
}

export interface GoalProgress {
  goalId: string;
  currentAmount: number;
  targetAmount: number;
  progress: number;
  remainingAmount: number;
  timeToTarget: {
    days: number;
    months: number;
    years: number;
  };
  monthlyContributionNeeded: number;
  isOnTrack: boolean;
  projectedCompletionDate: string;
}

// Analytics Types
export interface DashboardSummary {
  totalBalance: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyBudget: number;
  budgetUsed: number;
  savingsRate: number;
  cashFlowTrend: 'positive' | 'negative' | 'neutral';
  accountsCount: number;
  activeGoalsCount: number;
  completedGoalsCount: number;
  upcomingBills: Bill[];
  recentTransactions: Transaction[];
  budgetAlerts: BudgetAlert[];
  goalMilestones: GoalMilestone[];
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  category: string;
  isPaid: boolean;
  accountId: string;
}

export interface SpendingAnalysis {
  period: string;
  startDate: string;
  endDate: string;
  totalSpent: number;
  averageDaily: number;
  averageMonthly: number;
  categoryBreakdown: CategorySpending[];
  monthlyTrends: MonthlySpending[];
  topMerchants: MerchantSpending[];
  spendingPatterns: SpendingPattern[];
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  averageTransaction: number;
  change: number;
  changePercentage: number;
}

export interface MonthlySpending {
  month: string;
  amount: number;
  transactionCount: number;
  averageTransaction: number;
}

export interface MerchantSpending {
  merchant: string;
  amount: number;
  transactionCount: number;
  category: string;
  lastTransaction: string;
}

export interface SpendingPattern {
  pattern: string;
  description: string;
  frequency: number;
  amount: number;
  suggestion: string;
}

export interface IncomeAnalysis {
  period: string;
  startDate: string;
  endDate: string;
  totalIncome: number;
  averageMonthly: number;
  sourceBreakdown: IncomeSource[];
  monthlyTrends: MonthlyIncome[];
  growth: {
    amount: number;
    percentage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
}

export interface IncomeSource {
  source: string;
  amount: number;
  percentage: number;
  frequency: string;
  isRegular: boolean;
}

export interface MonthlyIncome {
  month: string;
  amount: number;
  sources: IncomeSource[];
}

export interface CashFlowData {
  period: string;
  startDate: string;
  endDate: string;
  totalInflow: number;
  totalOutflow: number;
  netCashFlow: number;
  dailyFlow: DailyCashFlow[];
  weeklyFlow: WeeklyCashFlow[];
  monthlyFlow: MonthlyCashFlow[];
  projections: CashFlowProjection[];
}

export interface DailyCashFlow {
  date: string;
  inflow: number;
  outflow: number;
  balance: number;
  netFlow: number;
}

export interface WeeklyCashFlow {
  week: string;
  inflow: number;
  outflow: number;
  netFlow: number;
}

export interface MonthlyCashFlow {
  month: string;
  inflow: number;
  outflow: number;
  netFlow: number;
  balance: number;
}

export interface CashFlowProjection {
  date: string;
  projectedBalance: number;
  projectedInflow: number;
  projectedOutflow: number;
  confidence: number;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'budget_alert' | 'goal_milestone' | 'bill_reminder' | 'transaction_alert' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  isActioned: boolean;
  actionUrl?: string;
  actionText?: string;
  relatedEntityId?: string;
  relatedEntityType?: 'budget' | 'goal' | 'transaction' | 'account';
  metadata?: Record<string, any>;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
}

export interface NotificationSettings {
  emailNotifications: {
    budgetAlerts: boolean;
    goalMilestones: boolean;
    billReminders: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;
    securityAlerts: boolean;
  };
  pushNotifications: {
    budgetAlerts: boolean;
    goalMilestones: boolean;
    billReminders: boolean;
    transactionAlerts: boolean;
    securityAlerts: boolean;
  };
  frequency: {
    digestFrequency: 'daily' | 'weekly' | 'monthly';
    reminderDays: number;
  };
}

// API Response Types
export type AccountsResponse = ApiResponse<Account[]>;
export type AccountResponse = ApiResponse<Account>;
export type TransactionsResponse = ApiResponse<Transaction[]>;
export type TransactionResponse = ApiResponse<Transaction>;
export type BudgetsResponse = ApiResponse<Budget[]>;
export type BudgetResponse = ApiResponse<Budget>;
export type GoalsResponse = ApiResponse<Goal[]>;
export type GoalResponse = ApiResponse<Goal>;
export type DashboardResponse = ApiResponse<DashboardSummary>;
export type SpendingAnalysisResponse = ApiResponse<SpendingAnalysis>;
export type IncomeAnalysisResponse = ApiResponse<IncomeAnalysis>;
export type CashFlowResponse = ApiResponse<CashFlowData>;
export type NotificationsResponse = ApiResponse<Notification[]>;
export type NotificationResponse = ApiResponse<Notification>;
