import { apiService } from './api';
import { ApiResponse } from '../types/api.types';

// Budget Types
export interface CreateBudgetRequest {
  name: string;
  category: string;
  budgetAmount: number;
  period: 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
  startDate: string;
  endDate: string;
  alertThreshold: number;
  isActive: boolean;
}

export interface UpdateBudgetRequest {
  name?: string;
  category?: string;
  budgetAmount?: number;
  period?: 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
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
  period: 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
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
  /**
   * Get All Budgets
   * GET /api/budgets
   */
  async getAllBudgets(): Promise<Budget[]> {
    const response = await apiService.get<ApiResponse<Budget[]>>('/budgets');
    return response.data;
  }

  /**
   * Get Budget by ID
   * GET /api/budgets/{budgetId}
   */
  async getBudgetById(budgetId: string): Promise<Budget> {
    const response = await apiService.get<ApiResponse<Budget>>(`/budgets/${budgetId}`);
    return response.data;
  }

  /**
   * Create Budget
   * POST /api/budgets
   */
  async createBudget(data: CreateBudgetRequest): Promise<Budget> {
    const response = await apiService.post<ApiResponse<Budget>>('/budgets', data);
    return response.data;
  }

  /**
   * Update Budget
   * PUT /api/budgets/{budgetId}
   */
  async updateBudget(budgetId: string, data: UpdateBudgetRequest): Promise<Budget> {
    const response = await apiService.put<ApiResponse<Budget>>(`/budgets/${budgetId}`, data);
    return response.data;
  }

  /**
   * Delete Budget
   * DELETE /api/budgets/{budgetId}
   */
  async deleteBudget(budgetId: string): Promise<{ message: string }> {
    const response = await apiService.delete<ApiResponse<{ message: string }>>(`/budgets/${budgetId}`);
    return response.data;
  }

  /**
   * Get Budget Progress
   * GET /api/budgets/{budgetId}/progress
   */
  async getBudgetProgress(budgetId: string): Promise<BudgetProgress> {
    const response = await apiService.get<ApiResponse<BudgetProgress>>(`/budgets/${budgetId}/progress`);
    return response.data;
  }
}

export const budgetApiService = new BudgetApiService();
