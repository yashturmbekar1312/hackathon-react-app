/**
 * Core API Types
 * Shared types and interfaces used across the application
 */

// Base API Response Structure
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: PaginationInfo;
  timestamp: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
  timestamp: string;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Request/Response Wrappers
export interface PaginatedRequest {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilteredRequest extends PaginatedRequest {
  search?: string;
  startDate?: string;
  endDate?: string;
}

// Common Enums
export enum TransactionType {
  INCOME = 'Income',
  EXPENSE = 'Expense',
  TRANSFER = 'Transfer',
}

export enum AccountType {
  CHECKING = 'Checking',
  SAVINGS = 'Savings',
  CREDIT_CARD = 'Credit Card',
  INVESTMENT = 'Investment',
  LOAN = 'Loan',
}

export enum BudgetPeriod {
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly',
  YEARLY = 'Yearly',
}

export enum GoalType {
  SAVINGS = 'Savings',
  DEBT_PAYOFF = 'Debt Payoff',
  INVESTMENT = 'Investment',
  PURCHASE = 'Purchase',
}

export enum NotificationType {
  BUDGET_ALERT = 'Budget Alert',
  GOAL_MILESTONE = 'Goal Milestone',
  BILL_REMINDER = 'Bill Reminder',
  TRANSACTION_ALERT = 'Transaction Alert',
  SYSTEM = 'System',
}

// Status Types
export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingState {
  status: RequestStatus;
  error?: string | null;
}

// Utility Types
export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
