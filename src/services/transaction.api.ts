import { apiService } from './api';
import { ApiResponse, PaginationInfo } from '../types/api.types';

// Transaction Types
export interface CreateTransactionRequest {
  accountId: string;
  amount: number;
  type: 'Income' | 'Expense';
  category: string;
  subcategory?: string;
  description: string;
  transactionDate: string;
  merchant?: string;
  location?: string;
  tags?: string[];
}

export interface UpdateTransactionRequest {
  amount?: number;
  category?: string;
  subcategory?: string;
  description?: string;
  merchant?: string;
  location?: string;
  tags?: string[];
}

export interface BulkTransactionRequest {
  transactions: CreateTransactionRequest[];
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  type: 'Income' | 'Expense';
  category: string;
  subcategory?: string;
  description: string;
  merchant?: string;
  location?: string;
  transactionDate: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface TransactionFilters {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  category?: string;
  type?: 'Income' | 'Expense';
  accountId?: string;
}

export interface PaginatedTransactions {
  data: Transaction[];
  pagination: PaginationInfo;
}

class TransactionApiService {
  /**
   * Get All Transactions with filters
   * GET /api/transactions?page=1&pageSize=20&startDate=2024-01-01&endDate=2024-12-31&category=Food&type=Expense
   */
  async getAllTransactions(filters?: TransactionFilters): Promise<PaginatedTransactions> {
    const response = await apiService.get<ApiResponse<Transaction[]>>('/transactions', filters);
    return {
      data: response.data,
      pagination: response.pagination!
    };
  }

  /**
   * Get Transaction by ID
   * GET /api/transactions/{transactionId}
   */
  async getTransactionById(transactionId: string): Promise<Transaction> {
    const response = await apiService.get<ApiResponse<Transaction>>(`/transactions/${transactionId}`);
    return response.data;
  }

  /**
   * Create Transaction
   * POST /api/transactions
   */
  async createTransaction(data: CreateTransactionRequest): Promise<Transaction> {
    const response = await apiService.post<ApiResponse<Transaction>>('/transactions', data);
    return response.data;
  }

  /**
   * Update Transaction
   * PUT /api/transactions/{transactionId}
   */
  async updateTransaction(transactionId: string, data: UpdateTransactionRequest): Promise<Transaction> {
    const response = await apiService.put<ApiResponse<Transaction>>(`/transactions/${transactionId}`, data);
    return response.data;
  }

  /**
   * Delete Transaction
   * DELETE /api/transactions/{transactionId}
   */
  async deleteTransaction(transactionId: string): Promise<{ message: string }> {
    const response = await apiService.delete<ApiResponse<{ message: string }>>(`/transactions/${transactionId}`);
    return response.data;
  }

  /**
   * Bulk Create Transactions
   * POST /api/transactions/bulk
   */
  async bulkCreateTransactions(data: BulkTransactionRequest): Promise<Transaction[]> {
    const response = await apiService.post<ApiResponse<Transaction[]>>('/transactions/bulk', data);
    return response.data;
  }
}

export const transactionApiService = new TransactionApiService();
