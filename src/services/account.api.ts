import { apiService } from './api';
import { ApiResponse } from './api';

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
  // Get All Accounts
  async getAllAccounts(): Promise<ApiResponse<Account[]>> {
    return apiService.get<ApiResponse<Account[]>>('/accounts');
  }

  // Get Account by ID
  async getAccountById(accountId: string): Promise<ApiResponse<Account>> {
    return apiService.get<ApiResponse<Account>>(`/accounts/${accountId}`);
  }

  // Create Account
  async createAccount(data: CreateAccountRequest): Promise<ApiResponse<Account>> {
    return apiService.post<ApiResponse<Account>>('/accounts', data);
  }

  // Update Account
  async updateAccount(accountId: string, data: UpdateAccountRequest): Promise<ApiResponse<Account>> {
    return apiService.put<ApiResponse<Account>>(`/accounts/${accountId}`, data);
  }

  // Delete Account
  async deleteAccount(accountId: string): Promise<ApiResponse<void>> {
    return apiService.delete<ApiResponse<void>>(`/accounts/${accountId}`);
  }
}

export const accountApiService = new AccountApiService();
