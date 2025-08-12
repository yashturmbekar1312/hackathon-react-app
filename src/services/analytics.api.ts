import { apiService } from './api';
import { ApiResponse } from './api';

// Analytics Types
export interface DashboardSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  monthlyBudget: number;
  budgetUsed: number;
  savingsRate: number;
  accountsCount: number;
  activeGoalsCount: number;
  recentTransactions: any[];
  upcomingBills: any[];
}

export interface SpendingAnalysis {
  period: string;
  totalSpent: number;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    transactionCount: number;
  }>;
  trends: Array<{
    date: string;
    amount: number;
  }>;
}

export interface IncomeAnalysis {
  period: string;
  totalIncome: number;
  sourceBreakdown: Array<{
    source: string;
    amount: number;
    percentage: number;
  }>;
  trends: Array<{
    date: string;
    amount: number;
  }>;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  subcategories?: Array<{
    name: string;
    amount: number;
    percentage: number;
  }>;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  netAmount: number;
  savings: number;
}

export interface CashFlowData {
  startDate: string;
  endDate: string;
  totalInflow: number;
  totalOutflow: number;
  netCashFlow: number;
  dailyFlow: Array<{
    date: string;
    inflow: number;
    outflow: number;
    balance: number;
  }>;
}

export interface AnalyticsFilters {
  period?: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  startDate?: string;
  endDate?: string;
  type?: 'Income' | 'Expense';
  months?: number;
}

class AnalyticsApiService {
  // Get Dashboard Summary
  async getDashboardSummary(): Promise<ApiResponse<DashboardSummary>> {
    return apiService.get<ApiResponse<DashboardSummary>>('/analytics/dashboard');
  }

  // Get Spending Analysis
  async getSpendingAnalysis(filters?: AnalyticsFilters): Promise<ApiResponse<SpendingAnalysis>> {
    return apiService.get<ApiResponse<SpendingAnalysis>>('/analytics/spending', filters);
  }

  // Get Income Analysis
  async getIncomeAnalysis(filters?: AnalyticsFilters): Promise<ApiResponse<IncomeAnalysis>> {
    return apiService.get<ApiResponse<IncomeAnalysis>>('/analytics/income', filters);
  }

  // Get Category Breakdown
  async getCategoryBreakdown(filters?: AnalyticsFilters): Promise<ApiResponse<CategoryBreakdown[]>> {
    return apiService.get<ApiResponse<CategoryBreakdown[]>>('/analytics/categories', filters);
  }

  // Get Monthly Trends
  async getMonthlyTrends(months: number = 12): Promise<ApiResponse<MonthlyTrend[]>> {
    return apiService.get<ApiResponse<MonthlyTrend[]>>('/analytics/trends', { months });
  }

  // Get Cash Flow
  async getCashFlow(startDate: string, endDate: string): Promise<ApiResponse<CashFlowData>> {
    return apiService.get<ApiResponse<CashFlowData>>('/analytics/cashflow', { startDate, endDate });
  }
}

export const analyticsApiService = new AnalyticsApiService();
