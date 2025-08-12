import { apiService } from './api';
import {
  Transaction,
  BankAccount,
  Budget,
  RecurringTransaction,
  TransactionCategory,
  TransactionType,
  CSVTransactionImport,
  AccountType
} from '../types/expense.types';
import { autoClassifyTransaction } from '../utils/helpers';

class ExpenseService {
  // Transaction Management
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    category?: TransactionCategory;
    type?: TransactionType;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ transactions: Transaction[]; total: number }> {
    // The API returns: { success: true, data: [], pagination: {...} }
    const response = await apiService.get<{
      success: boolean;
      data: any[];
      pagination: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
      };
    }>('/transactions', params);
    
    // Transform API response to match frontend expectations
    return {
      transactions: response.data || [], // Transform API data to Transaction objects if needed
      total: response.pagination?.totalItems || 0
    };
  }

  async createTransaction(transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    try {
      // Transform frontend Transaction to API payload format
      const amount = Math.abs(transactionData.amount);
      
      // Validate that bankAccountId is provided
      if (!transactionData.bankAccountId) {
        throw new Error('Bank account must be selected for transaction');
      }

      const apiPayload = {
        request: {
          linkedAccountId: transactionData.bankAccountId, // Use provided bankAccountId
          merchantId: null, // Will be set when merchant data is available
          categoryId: null, // Will be set when category mapping is available
          amount: Math.max(amount, 0.01), // Ensure minimum 0.01
          currencyCode: "INR", // Default currency
          transactionType: transactionData.type === TransactionType.EXPENSE ? "Expense" : "Income",
          description: transactionData.description,
          referenceNumber: `REF_${Date.now()}`, // Generate unique reference number
          transactionDate: transactionData.date.toISOString().split('T')[0], // YYYY-MM-DD format
          postedDate: transactionData.date.toISOString().split('T')[0], // Same as transaction date
          isRecurring: transactionData.isRecurring || false,
          recurringFrequency: transactionData.isRecurring ? "Monthly" : null, // Only set if recurring
          isTransfer: false, // Default to false
          transferToAccountId: null, // Only set if it's a transfer
          externalTransactionId: `EXT_${Date.now()}` // Generate unique external ID
        }
      };
      
      const result = await apiService.post<any>('/transactions', apiPayload);
      // Transform API response back to frontend Transaction format if needed
      // For now, create a Transaction object with the data we sent plus some defaults
      const createdTransaction: Transaction = {
        id: result.id || `temp_${Date.now()}`,
        userId: result.userId || 'current-user',
        amount: transactionData.amount, // Keep original amount with sign
        description: transactionData.description,
        date: transactionData.date,
        category: transactionData.category,
        subcategory: transactionData.subcategory,
        type: transactionData.type,
        source: transactionData.source,
        merchant: transactionData.merchant,
        location: transactionData.location,
        tags: transactionData.tags,
        accountId: transactionData.bankAccountId, // Use bankAccountId consistently
        isRecurring: transactionData.isRecurring,
        recurringId: transactionData.recurringId,
        bankAccountId: transactionData.bankAccountId,
        isManuallyClassified: transactionData.isManuallyClassified,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return createdTransaction;
    } catch (error) {
      // Log more details about the error
      if (error && typeof error === 'object') {
        const apiError = error as any;
        // If it's a validation error, provide more helpful message
        if (apiError.response?.status === 400 && apiError.response?.data?.errors) {
          const validationErrors = apiError.response.data.errors;
          const errorMessages = Object.entries(validationErrors)
            .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
            .join('; ');
          
          throw new Error(`Validation failed: ${errorMessages}`);
        }
      }
      
      throw error; // Re-throw to let upper layers handle it
    }
  }

  // Helper method to get category ID for API calls
  private getCategoryId(category: TransactionCategory): string {
    // For now, using a default GUID. In production, these should be fetched from the API
    // or maintained as constants based on your backend's category system
    const categoryIds: Record<TransactionCategory, string> = {
      [TransactionCategory.GROCERIES]: "11111111-1111-1111-1111-111111111111",
      [TransactionCategory.TRANSPORTATION]: "22222222-2222-2222-2222-222222222222",
      [TransactionCategory.ENTERTAINMENT]: "33333333-3333-3333-3333-333333333333",
      [TransactionCategory.UTILITIES]: "44444444-4444-4444-4444-444444444444",
      [TransactionCategory.HEALTHCARE]: "55555555-5555-5555-5555-555555555555",
      [TransactionCategory.SHOPPING]: "66666666-6666-6666-6666-666666666666",
      [TransactionCategory.FOOD_DINING]: "77777777-7777-7777-7777-777777777777",
      [TransactionCategory.EDUCATION]: "88888888-8888-8888-8888-888888888888",
      [TransactionCategory.SALARY]: "99999999-9999-9999-9999-999999999999",
      [TransactionCategory.INVESTMENT]: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      [TransactionCategory.RENT]: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      [TransactionCategory.SAVINGS]: "cccccccc-cccc-cccc-cccc-cccccccccccc",
      [TransactionCategory.OTHER]: "dddddddd-dddd-dddd-dddd-dddddddddddd"
    };
    
    return categoryIds[category] || categoryIds[TransactionCategory.OTHER];
  }

  // Helper method to map API categories to frontend format
  private mapApiCategoryToFrontend(categoryName: string): TransactionCategory {
    const categoryMap: Record<string, TransactionCategory> = {
      "Food": TransactionCategory.GROCERIES,
      "Transportation": TransactionCategory.TRANSPORTATION,
      "Entertainment": TransactionCategory.ENTERTAINMENT,
      "Utilities": TransactionCategory.UTILITIES,
      "Healthcare": TransactionCategory.HEALTHCARE,
      "Shopping": TransactionCategory.SHOPPING,
      "Education": TransactionCategory.EDUCATION,
      "Income": TransactionCategory.SALARY,
      "Investment": TransactionCategory.INVESTMENT,
      "Housing": TransactionCategory.RENT,
      "Savings": TransactionCategory.SAVINGS,
      "Other": TransactionCategory.OTHER
    };
    
    return categoryMap[categoryName] || TransactionCategory.OTHER;
  }

  async updateTransaction(transactionId: string, transactionData: Partial<Transaction>): Promise<Transaction> {
    return await apiService.put<Transaction>(`/transactions/${transactionId}`, transactionData);
  }

  async deleteTransaction(transactionId: string): Promise<void> {
    await apiService.delete(`/transactions/${transactionId}`);
  }

  async categorizeTransaction(transactionId: string, category: TransactionCategory): Promise<Transaction> {
    return await apiService.put<Transaction>(`/transactions/${transactionId}/categorize`, { category });
  }

  // Bank Account Management
  async getBankAccounts(): Promise<BankAccount[]> {
    return await apiService.get<BankAccount[]>('/bank-accounts');
  }

  async linkBankAccount(bankData: {
    bankName: string;
    accountNumber: string;
    accountType: AccountType;
  }): Promise<BankAccount> {
    return await apiService.post<BankAccount>('/bank-accounts/link', bankData);
  }

  async syncBankAccount(accountId: string): Promise<{ synced: number; message: string }> {
    return await apiService.post<{ synced: number; message: string }>(`/bank-accounts/${accountId}/sync`);
  }

  async importTransactionsFromCSV(file: File): Promise<{ imported: number; errors: string[] }> {
    return await apiService.uploadFile<{ imported: number; errors: string[] }>('/transactions/import-csv', file);
  }

  // Helper function to map numeric periodType to string
  private mapPeriodTypeToString(periodType: number): string {
    const periodTypeMap: Record<number, string> = {
      0: 'Daily',
      1: 'Weekly', 
      2: 'Monthly',
      3: 'Quarterly',
      4: 'Yearly'
    };
    return periodTypeMap[periodType] || 'Monthly';
  }

  // Helper function to map string period to numeric enum
  private mapStringToPeriodType(period: string): number {
    const periodTypeMap: Record<string, number> = {
      'Daily': 0,
      'Weekly': 1,
      'Monthly': 2,
      'Quarterly': 3,
      'Yearly': 4
    };
    return periodTypeMap[period] ?? 2; // Default to Monthly
  }

  // Budget Management
  async getBudgets(): Promise<Budget[]> {
    // API returns budget data with different structure
    const response = await apiService.get<any[]>('/Budgets');
    
    // Transform API response to match frontend Budget interface
    return response.map((apiBudget): Budget => ({
      id: apiBudget.id,
      userId: apiBudget.userId,
      name: apiBudget.categoryName || 'Budget',
      category: this.mapApiCategoryToFrontend(apiBudget.categoryName),
      budgetAmount: apiBudget.budgetAmount,
      amount: apiBudget.budgetAmount, // Keep for backwards compatibility
      spent: apiBudget.currentSpent,
      period: this.mapPeriodTypeToString(apiBudget.periodType),
      startDate: apiBudget.startDate,
      endDate: apiBudget.endDate,
      alertThreshold: apiBudget.utilizationPercentage >= 80 ? 80 : 90, // Default threshold
      isActive: apiBudget.isActive,
      createdAt: new Date(apiBudget.createdAt),
      updatedAt: new Date(apiBudget.updatedAt)
    }));
  }

  async createBudget(budgetData: Omit<Budget, 'id' | 'userId' | 'spent' | 'createdAt' | 'updatedAt'>): Promise<Budget> {
    // Transform frontend Budget data to API format with request wrapper
    const requestPayload = {
      request: {
        categoryId: this.getCategoryId(budgetData.category), // Use proper category ID mapping
        budgetAmount: Math.max(budgetData.budgetAmount, 0.01), // Ensure minimum amount
        periodType: this.mapStringToPeriodType(budgetData.period || "Monthly"),
        startDate: budgetData.startDate,
        endDate: budgetData.endDate,
        isActive: budgetData.isActive
      }
    };
    
    const response = await apiService.post<any>('/Budgets', requestPayload);
    
    // Transform API response back to frontend Budget format
    return {
      id: response.id,
      userId: response.userId,
      name: response.categoryName || budgetData.name,
      category: budgetData.category,
      budgetAmount: response.budgetAmount,
      amount: response.budgetAmount,
      spent: response.currentSpent || 0,
      period: this.mapPeriodTypeToString(response.periodType),
      startDate: response.startDate,
      endDate: response.endDate,
      alertThreshold: budgetData.alertThreshold,
      isActive: response.isActive,
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt)
    };
  }

  async updateBudget(budgetId: string, budgetData: Partial<Budget>): Promise<Budget> {
    // Transform frontend Budget data to API format with request wrapper
    const requestPayload = {
      request: {
        categoryId: budgetData.category ? this.getCategoryId(budgetData.category) : undefined,
        budgetAmount: budgetData.budgetAmount ? Math.max(budgetData.budgetAmount, 0.01) : undefined,
        periodType: budgetData.period ? this.mapStringToPeriodType(budgetData.period) : undefined,
        startDate: budgetData.startDate,
        endDate: budgetData.endDate,
        isActive: budgetData.isActive
      }
    };
    
    // Remove undefined values from request object
    Object.keys(requestPayload.request).forEach(key => 
      requestPayload.request[key as keyof typeof requestPayload.request] === undefined && 
      delete requestPayload.request[key as keyof typeof requestPayload.request]
    );
    
    const response = await apiService.put<any>(`/Budgets/${budgetId}`, requestPayload);
    
    // Transform API response back to frontend Budget format
    return {
      id: response.id,
      userId: response.userId,
      name: response.categoryName || budgetData.name || 'Budget',
      category: budgetData.category || this.mapApiCategoryToFrontend(response.categoryName),
      budgetAmount: response.budgetAmount,
      amount: response.budgetAmount,
      spent: response.currentSpent || 0,
      period: this.mapPeriodTypeToString(response.periodType),
      startDate: response.startDate,
      endDate: response.endDate,
      alertThreshold: budgetData.alertThreshold || 80,
      isActive: response.isActive,
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt)
    };
  }

  async deleteBudget(budgetId: string): Promise<void> {
    await apiService.delete(`/budgets/${budgetId}`);
  }

  // Recurring Transactions
  async getRecurringTransactions(): Promise<RecurringTransaction[]> {
    return await apiService.get<RecurringTransaction[]>('/recurring-transactions');
  }

  async detectRecurringTransactions(): Promise<RecurringTransaction[]> {
    return await apiService.post<RecurringTransaction[]>('/transactions/detect-recurring');
  }

  // Analytics
  async getSpendingByCategory(startDate: Date, endDate: Date): Promise<{ category: string; amount: number; percentage: number }[]> {
    return await apiService.get<{ category: string; amount: number; percentage: number }[]>('/analytics/spending-by-category', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
  }

  async getMonthlySpendingTrend(months: number = 6): Promise<{ month: string; amount: number }[]> {
    return await apiService.get<{ month: string; amount: number }[]>('/analytics/monthly-spending', { months });
  }

  // Mock functions for development
  async mockGetTransactions(): Promise<{ transactions: Transaction[]; total: number }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        userId: 'user_demo',
        amount: 5000,
        description: 'Monthly Salary',
        date: new Date(),
        category: TransactionCategory.SALARY,
        type: TransactionType.INCOME,
        source: 'bank_api' as any,
        isRecurring: true,
        isManuallyClassified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        userId: 'user_demo',
        amount: -1200,
        description: 'Apartment Rent',
        date: new Date(),
        category: TransactionCategory.RENT,
        type: TransactionType.EXPENSE,
        source: 'bank_api' as any,
        isRecurring: true,
        isManuallyClassified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        userId: 'user_demo',
        amount: -250,
        description: 'Grocery Store',
        date: new Date(),
        category: TransactionCategory.GROCERIES,
        type: TransactionType.EXPENSE,
        source: 'bank_api' as any,
        isRecurring: false,
        isManuallyClassified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    return { transactions: mockTransactions, total: mockTransactions.length };
  }

  async mockGetBudgets(): Promise<Budget[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const mockBudgets: Budget[] = [
      {
        id: '1',
        userId: 'user_demo',
        name: 'Monthly Groceries Budget',
        category: TransactionCategory.GROCERIES,
        budgetAmount: 500,
        amount: 500, // Keep for backwards compatibility
        spent: 250,
        period: 'Monthly',
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: endOfMonth.toISOString().split('T')[0],
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        alertThreshold: 80,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        userId: 'user_demo',
        name: 'Monthly Entertainment Budget',
        category: TransactionCategory.ENTERTAINMENT,
        budgetAmount: 200,
        amount: 200, // Keep for backwards compatibility
        spent: 150,
        period: 'Monthly',
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: endOfMonth.toISOString().split('T')[0],
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        alertThreshold: 80,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    return mockBudgets;
  }

  async mockImportCSV(csvData: CSVTransactionImport[]): Promise<{ imported: number; errors: string[] }> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const errors: string[] = [];
    let imported = 0;
    
    for (const row of csvData) {
      try {
        const amount = parseFloat(row.amount);
        if (isNaN(amount)) {
          errors.push(`Invalid amount: ${row.amount}`);
          continue;
        }
        
        const date = new Date(row.date);
        if (isNaN(date.getTime())) {
          errors.push(`Invalid date: ${row.date}`);
          continue;
        }
        
        // Auto-classify if category not provided
        row.category 
          ? { category: row.category as TransactionCategory, type: amount > 0 ? TransactionType.INCOME : TransactionType.EXPENSE }
          : autoClassifyTransaction(row.description);
        
        imported++;
      } catch (error) {
        errors.push(`Error processing row: ${error}`);
      }
    }
    
    return { imported, errors };
  }

  // Utility functions
  parseCSVFile(file: File): Promise<CSVTransactionImport[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          const lines = csv.split('\n');
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          
          const transactions: CSVTransactionImport[] = [];
          
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            if (values.length >= 3) {
              const transaction: CSVTransactionImport = {
                date: values[headers.indexOf('date')] || values[0],
                description: values[headers.indexOf('description')] || values[1],
                amount: values[headers.indexOf('amount')] || values[2],
                category: values[headers.indexOf('category')] || undefined
              };
              transactions.push(transaction);
            }
          }
          
          resolve(transactions);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  }

  calculateBudgetUtilization(budget: Budget): number {
    const budgetValue = budget.budgetAmount || budget.amount || 0;
    return budgetValue > 0 ? (Math.abs(budget.spent) / budgetValue) * 100 : 0;
  }

  isBudgetNearLimit(budget: Budget): boolean {
    return this.calculateBudgetUtilization(budget) >= budget.alertThreshold;
  }

  isBudgetExceeded(budget: Budget): boolean {
    return this.calculateBudgetUtilization(budget) >= 100;
  }

  getTotalIncome(transactions: Transaction[]): number {
    return transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalExpenses(transactions: Transaction[]): number {
    return Math.abs(transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0));
  }

  getNetSavings(transactions: Transaction[]): number {
    return this.getTotalIncome(transactions) - this.getTotalExpenses(transactions);
  }
}

export const expenseService = new ExpenseService();
export default expenseService;

