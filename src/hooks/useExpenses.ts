import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { expenseService } from '../services/expense.service';
import {
  Transaction,
  Budget,
  BankAccount,
  TransactionCategory,
  TransactionType
} from '../types/expense.types';

export const useExpenses = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [bankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch transactions
  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      // Use real API instead of mock
      const result = await expenseService.getTransactions();
      setTransactions(result.transactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch budgets
  const fetchBudgets = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      // Use real API instead of mock
      const budgetList = await expenseService.getBudgets();
      setBudgets(budgetList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch budgets');
    } finally {
      setIsLoading(false);
    }
  };

  // Add transaction
  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      
      // Check if user exists
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Call ONLY the actual API service - no mocks
      console.log('useExpenses: Calling API expenseService.createTransaction');
      const newTransaction = await expenseService.createTransaction(transactionData);
      console.log('useExpenses: API call successful, transaction created:', newTransaction);
      
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add transaction';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update transaction category
  const updateTransactionCategory = async (transactionId: string, category: TransactionCategory) => {
    try {
      setError(null);
      setTransactions(prev => 
        prev.map(transaction => 
          transaction.id === transactionId 
            ? { ...transaction, category, isManuallyClassified: true, updatedAt: new Date() }
            : transaction
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update transaction';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Create budget
  const createBudget = async (budgetData: Omit<Budget, 'id' | 'userId' | 'spent' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const newBudget: Budget = {
        ...budgetData,
        id: `budget_${Date.now()}`,
        userId: user?.id || '',
        spent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setBudgets(prev => [...prev, newBudget]);
      return newBudget;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create budget';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update budget
  const updateBudget = async (budgetId: string, budgetData: Partial<Budget>) => {
    try {
      setError(null);
      setBudgets(prev => 
        prev.map(budget => 
          budget.id === budgetId 
            ? { ...budget, ...budgetData, updatedAt: new Date() }
            : budget
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update budget';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Import CSV transactions
  const importCSVTransactions = async (csvData: any[]) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await expenseService.mockImportCSV(csvData);
      
      // Refresh transactions after import
      await fetchTransactions();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import transactions';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate totals
  const getTotalIncome = (): number => {
    if (!transactions || !Array.isArray(transactions)) return 0;
    return expenseService.getTotalIncome(transactions);
  };

  const getTotalExpenses = (): number => {
    if (!transactions || !Array.isArray(transactions)) return 0;
    return expenseService.getTotalExpenses(transactions);
  };

  const getNetSavings = (): number => {
    if (!transactions || !Array.isArray(transactions)) return 0;
    return expenseService.getNetSavings(transactions);
  };

  // Get spending by category
  const getSpendingByCategory = (): { category: string; amount: number; percentage: number }[] => {
    if (!transactions || !Array.isArray(transactions)) {
      console.warn('getSpendingByCategory: transactions is not available or not an array:', transactions);
      return [];
    }
    
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
    const totalExpenses = Math.abs(expenses.reduce((sum, t) => sum + t.amount, 0));
    
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach(transaction => {
      const category = transaction.category;
      categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(transaction.amount);
    });
    
    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }));
  };

  // Check budget alerts
  const getBudgetAlerts = () => {
    if (!budgets || !Array.isArray(budgets)) {
      console.warn('getBudgetAlerts: budgets is not available or not an array:', budgets);
      return [];
    }
    return budgets.filter(budget => {
      const utilization = expenseService.calculateBudgetUtilization(budget);
      return utilization >= budget.alertThreshold;
    });
  };

  // Check if budget is exceeded
  const getExceededBudgets = () => {
    if (!budgets || !Array.isArray(budgets)) {
      console.warn('getExceededBudgets: budgets is not available or not an array:', budgets);
      return [];
    }
    return budgets.filter(budget => expenseService.isBudgetExceeded(budget));
  };

  // Initialize data on mount
  useEffect(() => {
    fetchTransactions();
    fetchBudgets();
  }, [user]);

  return {
    transactions,
    budgets,
    bankAccounts,
    isLoading,
    error,
    fetchTransactions,
    fetchBudgets,
    addTransaction,
    updateTransactionCategory,
    createBudget,
    updateBudget,
    importCSVTransactions,
    getTotalIncome,
    getTotalExpenses,
    getNetSavings,
    getSpendingByCategory,
    getBudgetAlerts,
    getExceededBudgets,
  };
};
