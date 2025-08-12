import { apiService } from './api';
import { ApiResponse } from './api';

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

class TransactionApiService {
  // Get All Transactions with filters
  async getAllTransactions(filters?: TransactionFilters): Promise<ApiResponse<Transaction[]>> {
    return apiService.get<ApiResponse<Transaction[]>>('/transactions', filters);
  }

  // Get Transaction by ID
  async getTransactionById(transactionId: string): Promise<ApiResponse<Transaction>> {
    return apiService.get<ApiResponse<Transaction>>(`/transactions/${transactionId}`);
  }

  // Create Transaction
  async createTransaction(data: CreateTransactionRequest): Promise<ApiResponse<Transaction>> {
    return apiService.post<ApiResponse<Transaction>>('/transactions', data);
  }

  // Update Transaction
  async updateTransaction(transactionId: string, data: UpdateTransactionRequest): Promise<ApiResponse<Transaction>> {
    return apiService.put<ApiResponse<Transaction>>(`/transactions/${transactionId}`, data);
  }

  // Delete Transaction
  async deleteTransaction(transactionId: string): Promise<ApiResponse<void>> {
    return apiService.delete<ApiResponse<void>>(`/transactions/${transactionId}`);
  }

  // Bulk Create Transactions
  async bulkCreateTransactions(data: BulkTransactionRequest): Promise<ApiResponse<Transaction[]>> {
    return apiService.post<ApiResponse<Transaction[]>>('/transactions/bulk', data);
  }
}

export const transactionApiService = new TransactionApiService();
