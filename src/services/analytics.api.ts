import { apiService } from './api';
import { ApiResponse } from '../types/api.types';

// Analytics Types
export interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netSavings: number;
  savingsRate: number;
  budgetAlerts: number;
  upcomingBills: number;
  goalProgress: number;
}

export interface SpendingAnalysisParams {
  period: 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
  startDate?: string;
  endDate?: string;
}

export interface SpendingAnalysis {
  totalSpent: number;
  averageDaily: number;
  topCategories: CategorySpending[];
  trends: SpendingTrend[];
  comparison: {
    previousPeriod: number;
    changePercent: number;
  };
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface SpendingTrend {
  date: string;
  amount: number;
  category?: string;
}

export interface IncomeAnalysisParams {
  period: 'Monthly' | 'Quarterly' | 'Yearly';
  startDate?: string;
  endDate?: string;
}

export interface IncomeAnalysis {
  totalIncome: number;
  averageMonthly: number;
  sources: IncomeSource[];
  trends: IncomeTrend[];
  growth: {
    previousPeriod: number;
    changePercent: number;
  };
}

export interface IncomeSource {
  source: string;
  amount: number;
  percentage: number;
}

export interface IncomeTrend {
  date: string;
  amount: number;
}

export interface CategoryBreakdownParams {
  type: 'Income' | 'Expense';
  period: 'Monthly' | 'Quarterly' | 'Yearly';
}

export interface CategoryBreakdown {
  categories: CategorySpending[];
  totalAmount: number;
  period: string;
}

export interface MonthlyTrendsParams {
  months: number;
}

export interface MonthlyTrends {
  income: MonthlyData[];
  expenses: MonthlyData[];
  savings: MonthlyData[];
  netWorth: MonthlyData[];
}

export interface MonthlyData {
  month: string;
  amount: number;
}

export interface CashFlowParams {
  startDate: string;
  endDate: string;
}

export interface CashFlow {
  inflows: CashFlowItem[];
  outflows: CashFlowItem[];
  netFlow: number;
  periods: CashFlowPeriod[];
}

export interface CashFlowItem {
  category: string;
  amount: number;
  percentage: number;
}

export interface CashFlowPeriod {
  date: string;
  inflow: number;
  outflow: number;
  netFlow: number;
}

class AnalyticsApiService {
  /**
   * Get Dashboard Summary
   * GET /api/analytics/dashboard
   */
  async getDashboardSummary(): Promise<DashboardSummary> {
    const response = await apiService.get<ApiResponse<DashboardSummary>>('/analytics/dashboard');
    return response.data;
  }

  /**
   * Get Spending Analysis
   * GET /api/analytics/spending?period=Monthly&startDate=2024-01-01&endDate=2024-12-31
   */
  async getSpendingAnalysis(params: SpendingAnalysisParams): Promise<SpendingAnalysis> {
    const response = await apiService.get<ApiResponse<SpendingAnalysis>>('/analytics/spending', params);
    return response.data;
  }

  /**
   * Get Income Analysis
   * GET /api/analytics/income?period=Monthly&startDate=2024-01-01&endDate=2024-12-31
   */
  async getIncomeAnalysis(params: IncomeAnalysisParams): Promise<IncomeAnalysis> {
    const response = await apiService.get<ApiResponse<IncomeAnalysis>>('/analytics/income', params);
    return response.data;
  }

  /**
   * Get Category Breakdown
   * GET /api/analytics/categories?type=Expense&period=Monthly
   */
  async getCategoryBreakdown(params: CategoryBreakdownParams): Promise<CategoryBreakdown> {
    const response = await apiService.get<ApiResponse<CategoryBreakdown>>('/analytics/categories', params);
    return response.data;
  }

  /**
   * Get Monthly Trends
   * GET /api/analytics/trends?months=12
   */
  async getMonthlyTrends(params: MonthlyTrendsParams): Promise<MonthlyTrends> {
    const response = await apiService.get<ApiResponse<MonthlyTrends>>('/analytics/trends', params);
    return response.data;
  }

  /**
   * Get Cash Flow
   * GET /api/analytics/cashflow?startDate=2024-01-01&endDate=2024-12-31
   */
  async getCashFlow(params: CashFlowParams): Promise<CashFlow> {
    const response = await apiService.get<ApiResponse<CashFlow>>('/analytics/cashflow', params);
    return response.data;
  }
}

export const analyticsApiService = new AnalyticsApiService();
