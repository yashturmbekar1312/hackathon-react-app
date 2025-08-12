import { apiService } from './api';
import { ApiResponse } from '../types/api.types';

// Account Management Types
export interface CreateAccountRequest {
  accountName: string;
  accountType: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  balance: number;
  currency: string;
}

export interface UpdateAccountRequest {
  accountName?: string;
  accountType?: string;
  bankName?: string;
  balance?: number;
}

export interface Account {
  id: string;
  accountName: string;
  accountType: string;
  bankName: string;
  accountNumber?: string;
  routingNumber?: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

class AccountApiService {
  /**
   * Get All Accounts
   * GET /accounts
   */
  async getAllAccounts(): Promise<Account[]> {
    const response = await apiService.get<ApiResponse<Account[]>>('/accounts');
    return response.data;
  }

  /**
   * Get Account by ID
   * GET /accounts/{accountId}
   */
  async getAccountById(accountId: string): Promise<Account> {
    const response = await apiService.get<ApiResponse<Account>>(`/accounts/${accountId}`);
    return response.data;
  }

  /**
   * Create Account
   * POST /accounts
   */
  async createAccount(data: CreateAccountRequest): Promise<Account> {
    const response = await apiService.post<ApiResponse<Account>>('/accounts', data);
    return response.data;
  }

  /**
   * Update Account
   * PUT /accounts/{accountId}
   */
  async updateAccount(accountId: string, data: UpdateAccountRequest): Promise<Account> {
    const response = await apiService.put<ApiResponse<Account>>(`/accounts/${accountId}`, data);
    return response.data;
  }

  /**
   * Delete Account
   * DELETE /accounts/{accountId}
   */
  async deleteAccount(accountId: string): Promise<{ message: string }> {
    const response = await apiService.delete<ApiResponse<{ message: string }>>(`/accounts/${accountId}`);
    return response.data;
  }
}

export const accountApiService = new AccountApiService();
