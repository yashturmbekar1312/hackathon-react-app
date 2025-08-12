import { apiService } from './api';
import { ApiResponse } from './api';

// Budget Types
export interface CreateBudgetRequest {
  name: string;
  category: string;
  budgetAmount: number;
  period: 'Weekly' | 'Monthly' | 'Yearly';
  startDate: string;
  endDate: string;
  alertThreshold: number;
  isActive: boolean;
}

export interface UpdateBudgetRequest {
  name?: string;
  category?: string;
  budgetAmount?: number;
  period?: 'Weekly' | 'Monthly' | 'Yearly';
  startDate?: string;
  endDate?: string;
  alertThreshold?: number;
  isActive?: boolean;
}

export interface Budget {
  id: string;
  name: string;
  category: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  progress: number;
  period: 'Weekly' | 'Monthly' | 'Yearly';
  startDate: string;
  endDate: string;
  alertThreshold: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface BudgetProgress {
  budgetId: string;
  spentAmount: number;
  remainingAmount: number;
  progress: number;
  isOverBudget: boolean;
  daysRemaining: number;
  averageDailySpending: number;
  projectedSpending: number;
}

class BudgetApiService {
  // Get All Budgets
  async getAllBudgets(): Promise<ApiResponse<Budget[]>> {
    return apiService.get<ApiResponse<Budget[]>>('/budgets');
  }

  // Get Budget by ID
  async getBudgetById(budgetId: string): Promise<ApiResponse<Budget>> {
    return apiService.get<ApiResponse<Budget>>(`/budgets/${budgetId}`);
  }

  // Create Budget
  async createBudget(data: CreateBudgetRequest): Promise<ApiResponse<Budget>> {
    return apiService.post<ApiResponse<Budget>>('/budgets', data);
  }

  // Update Budget
  async updateBudget(budgetId: string, data: UpdateBudgetRequest): Promise<ApiResponse<Budget>> {
    return apiService.put<ApiResponse<Budget>>(`/budgets/${budgetId}`, data);
  }

  // Delete Budget
  async deleteBudget(budgetId: string): Promise<ApiResponse<void>> {
    return apiService.delete<ApiResponse<void>>(`/budgets/${budgetId}`);
  }

  // Get Budget Progress
  async getBudgetProgress(budgetId: string): Promise<ApiResponse<BudgetProgress>> {
    return apiService.get<ApiResponse<BudgetProgress>>(`/budgets/${budgetId}/progress`);
  }
}

export const budgetApiService = new BudgetApiService();
