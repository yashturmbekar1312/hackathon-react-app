/**
 * Account Management API Endpoints
 */

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../config";
import {
  CreateAccountRequest,
  UpdateAccountRequest,
  AccountBalanceHistory,
  AccountsResponse,
  AccountResponse,
} from "../../types/financial.types";
import {
  BankAccount,
  LinkAccountRequest,
  UpdateAccountRequest as BankUpdateRequest,
} from "../../types/account.types";
import { ApiResponse } from "../../types/api.types";

export class AccountApiService {
  /**
   * Link a new bank account
   */
  async linkBankAccount(accountData: LinkAccountRequest): Promise<BankAccount> {
    const response = await apiClient.post("/api/Accounts/link", accountData);
    return response.data as BankAccount;
  }

  /**
   * Get all linked bank accounts
   */
  async getLinkedAccounts(): Promise<BankAccount[]> {
    const response = await apiClient.get("/api/Accounts");
    return response.data as BankAccount[];
  }

  /**
   * Get specific bank account by ID
   */
  async getBankAccountById(accountId: string): Promise<BankAccount> {
    const response = await apiClient.get(`/api/Accounts/${accountId}`);
    return response.data as BankAccount;
  }

  /**
   * Update bank account details
   */
  async updateBankAccount(
    accountId: string,
    updateData: BankUpdateRequest
  ): Promise<BankAccount> {
    const response = await apiClient.put(
      `/api/Accounts/${accountId}`,
      updateData
    );
    return response.data as BankAccount;
  }

  /**
   * Delete bank account
   */
  async deleteBankAccount(accountId: string): Promise<void> {
    await apiClient.delete(`/api/Accounts/${accountId}`);
  }

  /**
   * Get all user accounts
   */
  async getAllAccounts(): Promise<AccountsResponse> {
    return apiClient.get(API_ENDPOINTS.ACCOUNTS.BASE);
  }

  /**
   * Get account by ID
   */
  async getAccountById(accountId: string): Promise<AccountResponse> {
    return apiClient.get(API_ENDPOINTS.ACCOUNTS.BY_ID(accountId));
  }

  /**
   * Create new account
   */
  async createAccount(data: CreateAccountRequest): Promise<AccountResponse> {
    return apiClient.post(API_ENDPOINTS.ACCOUNTS.BASE, data);
  }

  /**
   * Update account
   */
  async updateAccount(
    accountId: string,
    data: UpdateAccountRequest
  ): Promise<AccountResponse> {
    return apiClient.put(API_ENDPOINTS.ACCOUNTS.BY_ID(accountId), data);
  }

  /**
   * Delete account
   */
  async deleteAccount(accountId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(API_ENDPOINTS.ACCOUNTS.BY_ID(accountId));
  }

  /**
   * Get account balance history
   */
  async getBalanceHistory(
    accountId: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<AccountBalanceHistory[]>> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return apiClient.get(API_ENDPOINTS.ACCOUNTS.BALANCE_HISTORY(accountId), {
      params,
    });
  }

  /**
   * Set account as primary
   */
  async setPrimaryAccount(accountId: string): Promise<AccountResponse> {
    return apiClient.patch(
      `${API_ENDPOINTS.ACCOUNTS.BY_ID(accountId)}/set-primary`
    );
  }

  /**
   * Archive account
   */
  async archiveAccount(accountId: string): Promise<AccountResponse> {
    return apiClient.patch(
      `${API_ENDPOINTS.ACCOUNTS.BY_ID(accountId)}/archive`
    );
  }

  /**
   * Restore archived account
   */
  async restoreAccount(accountId: string): Promise<AccountResponse> {
    return apiClient.patch(
      `${API_ENDPOINTS.ACCOUNTS.BY_ID(accountId)}/restore`
    );
  }

  /**
   * Get account summary
   */
  async getAccountSummary(accountId: string): Promise<
    ApiResponse<{
      balance: number;
      monthlyIncome: number;
      monthlyExpenses: number;
      transactionCount: number;
      lastTransaction: any;
    }>
  > {
    return apiClient.get(`${API_ENDPOINTS.ACCOUNTS.BY_ID(accountId)}/summary`);
  }
}

export const accountApiService = new AccountApiService();
