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
    return await apiService.get<{ transactions: Transaction[]; total: number }>('/transactions', params);
  }

  async createTransaction(transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    return await apiService.post<Transaction>('/transactions', transactionData);
  }

  async updateTransaction(transactionId: string, transactionData: Partial<Transaction>): Promise<Transaction> {
    return await apiService.patch<Transaction>(`/transactions/${transactionId}`, transactionData);
  }

  async deleteTransaction(transactionId: string): Promise<void> {
    await apiService.delete(`/transactions/${transactionId}`);
  }

  async categorizeTransaction(transactionId: string, category: TransactionCategory): Promise<Transaction> {
    return await apiService.patch<Transaction>(`/transactions/${transactionId}/categorize`, { category });
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
    return await apiService.patch<Budget>(`/budgets/${budgetId}`, budgetData);
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
    const mockBudgets: Budget[] = [
      {
        id: '1',
        userId: 'user_demo',
        category: TransactionCategory.GROCERIES,
        amount: 500,
        spent: 250,
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        alertThreshold: 80,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        userId: 'user_demo',
        category: TransactionCategory.ENTERTAINMENT,
        amount: 200,
        spent: 150,
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        alertThreshold: 80,
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
    return budget.amount > 0 ? (Math.abs(budget.spent) / budget.amount) * 100 : 0;
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
