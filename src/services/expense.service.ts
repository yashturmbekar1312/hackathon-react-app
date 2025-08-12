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
    console.log('expenseService: createTransaction called with data:', transactionData);
    
    try {
      // Transform frontend Transaction to API payload format
      const amount = Math.abs(transactionData.amount);
      const apiPayload = {
        linkedAccountId: transactionData.accountId || "3fa85f64-5717-4562-b3fc-2c963f66afa6", // Use default GUID if not provided
        merchantId: "3fa85f64-5717-4562-b3fc-2c963f66afa6", // Default merchant ID
        categoryId: "3fa85f64-5717-4562-b3fc-2c963f66afa6", // Default category ID
        amount: Math.max(amount, 0.01), // Ensure minimum 0.01
        currencyCode: "USD", // Default currency
        transactionType: transactionData.type === TransactionType.EXPENSE ? "Expense" : "Income",
        description: transactionData.description,
        referenceNumber: `REF_${Date.now()}`, // Generate reference number
        transactionDate: transactionData.date.toISOString().split('T')[0], // YYYY-MM-DD format
        postedDate: transactionData.date.toISOString().split('T')[0], // Same as transaction date
        isRecurring: transactionData.isRecurring || false,
        recurringFrequency: transactionData.isRecurring ? "Monthly" : "", // Default frequency if recurring
        isTransfer: false, // Default to false
        transferToAccountId: null, // Only set if it's a transfer
        externalTransactionId: `EXT_${Date.now()}` // Generate external ID
      };
      
      console.log('expenseService: Sending API payload:', apiPayload);
      
      const result = await apiService.post<any>('/transactions', apiPayload);
      console.log('expenseService: createTransaction API call successful:', result);
      
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
        accountId: apiPayload.linkedAccountId, // Use linkedAccountId from payload
        isRecurring: transactionData.isRecurring,
        recurringId: transactionData.recurringId,
        bankAccountId: transactionData.bankAccountId,
        isManuallyClassified: transactionData.isManuallyClassified,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return createdTransaction;
    } catch (error) {
      console.error('expenseService: createTransaction API call failed:', error);
      
      // Log more details about the error
      if (error && typeof error === 'object') {
        const apiError = error as any;
        console.error('expenseService: Error details:', {
          message: apiError.message,
          response: apiError.response?.data,
          status: apiError.response?.status,
          code: apiError.code,
        });
        
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

  // Helper method to map frontend categories to API format
  // private mapCategoryToApiFormat(category: TransactionCategory): string {
  //   const categoryMap: Record<TransactionCategory, string> = {
  //     [TransactionCategory.GROCERIES]: "Food",
  //     [TransactionCategory.TRANSPORTATION]: "Transportation", 
  //     [TransactionCategory.ENTERTAINMENT]: "Entertainment",
  //     [TransactionCategory.UTILITIES]: "Utilities",
  //     [TransactionCategory.HEALTHCARE]: "Healthcare",
  //     [TransactionCategory.SHOPPING]: "Shopping",
  //     [TransactionCategory.FOOD_DINING]: "Food",
  //     [TransactionCategory.EDUCATION]: "Education",
  //     [TransactionCategory.SALARY]: "Income",
  //     [TransactionCategory.INVESTMENT]: "Investment",
  //     [TransactionCategory.RENT]: "Housing",
  //     [TransactionCategory.SAVINGS]: "Savings",
  //     [TransactionCategory.OTHER]: "Other"
  //   };
    
  //   return categoryMap[category] || "Other";
  // }

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

  // Budget Management
  async getBudgets(month?: number, year?: number): Promise<Budget[]> {
    const params = month && year ? { month, year } : {};
    return await apiService.get<Budget[]>('/budgets', params);
  }

  async createBudget(budgetData: Omit<Budget, 'id' | 'userId' | 'spent' | 'createdAt' | 'updatedAt'>): Promise<Budget> {
    return await apiService.post<Budget>('/budgets', budgetData);
  }

  async updateBudget(budgetId: string, budgetData: Partial<Budget>): Promise<Budget> {
    return await apiService.put<Budget>(`/budgets/${budgetId}`, budgetData);
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
