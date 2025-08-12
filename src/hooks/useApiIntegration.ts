import { useState, useCallback } from 'react';
import { userApiService } from '../services/user.api';
import { accountApiService } from '../services/account.api';
import { transactionApiService } from '../services/transaction.api';
import { budgetApiService } from '../services/budget.api';
import { analyticsApiService } from '../services/analytics.api';
import { useToast } from '../contexts/ToastContext';

// Generic API hook for handling loading states and errors
export function useApiCall<T extends (...args: any[]) => Promise<any>>(
  apiFunction: T
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showError } = useToast();

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await apiFunction(...args);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        showError('API Error', errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction, showError]
  );

  return { execute, isLoading, error };
}

// User Profile Management Hook
export function useUserProfile() {
  const { execute: getProfile, isLoading: isGettingProfile, error: getProfileError } = 
    useApiCall(userApiService.getProfile);
  
  const { execute: updateProfile, isLoading: isUpdatingProfile, error: updateProfileError } = 
    useApiCall(userApiService.updateProfile);
  
  const { execute: changePassword, isLoading: isChangingPassword, error: changePasswordError } = 
    useApiCall(userApiService.changePassword);
  
  const { execute: deleteAccount, isLoading: isDeletingAccount, error: deleteAccountError } = 
    useApiCall(userApiService.deleteAccount);

  return {
    // Profile methods
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount,
    
    // Loading states
    isGettingProfile,
    isUpdatingProfile,
    isChangingPassword,
    isDeletingAccount,
    
    // Error states
    getProfileError,
    updateProfileError,
    changePasswordError,
    deleteAccountError,
    
    // Combined loading state
    isLoading: isGettingProfile || isUpdatingProfile || isChangingPassword || isDeletingAccount,
  };
}

// Account Management Hook
export function useAccountManagement() {
  const { execute: getAllAccounts, isLoading: isGettingAccounts, error: getAccountsError } = 
    useApiCall(accountApiService.getAllAccounts);
  
  const { execute: getAccountById, isLoading: isGettingAccount, error: getAccountError } = 
    useApiCall(accountApiService.getAccountById);
  
  const { execute: createAccount, isLoading: isCreatingAccount, error: createAccountError } = 
    useApiCall(accountApiService.createAccount);
  
  const { execute: updateAccount, isLoading: isUpdatingAccount, error: updateAccountError } = 
    useApiCall(accountApiService.updateAccount);
  
  const { execute: deleteAccount, isLoading: isDeletingAccount, error: deleteAccountError } = 
    useApiCall(accountApiService.deleteAccount);

  return {
    // Account methods
    getAllAccounts,
    getAccountById,
    createAccount,
    updateAccount,
    deleteAccount,
    
    // Loading states
    isGettingAccounts,
    isGettingAccount,
    isCreatingAccount,
    isUpdatingAccount,
    isDeletingAccount,
    
    // Error states
    getAccountsError,
    getAccountError,
    createAccountError,
    updateAccountError,
    deleteAccountError,
    
    // Combined loading state
    isLoading: isGettingAccounts || isGettingAccount || isCreatingAccount || isUpdatingAccount || isDeletingAccount,
  };
}

// Transaction Management Hook
export function useTransactionManagement() {
  const { execute: getAllTransactions, isLoading: isGettingTransactions, error: getTransactionsError } = 
    useApiCall(transactionApiService.getAllTransactions);
  
  const { execute: getTransactionById, isLoading: isGettingTransaction, error: getTransactionError } = 
    useApiCall(transactionApiService.getTransactionById);
  
  const { execute: createTransaction, isLoading: isCreatingTransaction, error: createTransactionError } = 
    useApiCall(transactionApiService.createTransaction);
  
  const { execute: updateTransaction, isLoading: isUpdatingTransaction, error: updateTransactionError } = 
    useApiCall(transactionApiService.updateTransaction);
  
  const { execute: deleteTransaction, isLoading: isDeletingTransaction, error: deleteTransactionError } = 
    useApiCall(transactionApiService.deleteTransaction);
  
  const { execute: bulkCreateTransactions, isLoading: isBulkCreating, error: bulkCreateError } = 
    useApiCall(transactionApiService.bulkCreateTransactions);

  return {
    // Transaction methods
    getAllTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    bulkCreateTransactions,
    
    // Loading states
    isGettingTransactions,
    isGettingTransaction,
    isCreatingTransaction,
    isUpdatingTransaction,
    isDeletingTransaction,
    isBulkCreating,
    
    // Error states
    getTransactionsError,
    getTransactionError,
    createTransactionError,
    updateTransactionError,
    deleteTransactionError,
    bulkCreateError,
    
    // Combined loading state
    isLoading: isGettingTransactions || isGettingTransaction || isCreatingTransaction || 
               isUpdatingTransaction || isDeletingTransaction || isBulkCreating,
  };
}

// Budget Management Hook
export function useBudgetManagement() {
  const { execute: getAllBudgets, isLoading: isGettingBudgets, error: getBudgetsError } = 
    useApiCall(budgetApiService.getAllBudgets);
  
  const { execute: getBudgetById, isLoading: isGettingBudget, error: getBudgetError } = 
    useApiCall(budgetApiService.getBudgetById);
  
  const { execute: createBudget, isLoading: isCreatingBudget, error: createBudgetError } = 
    useApiCall(budgetApiService.createBudget);
  
  const { execute: updateBudget, isLoading: isUpdatingBudget, error: updateBudgetError } = 
    useApiCall(budgetApiService.updateBudget);
  
  const { execute: deleteBudget, isLoading: isDeletingBudget, error: deleteBudgetError } = 
    useApiCall(budgetApiService.deleteBudget);
  
  const { execute: getBudgetProgress, isLoading: isGettingProgress, error: getProgressError } = 
    useApiCall(budgetApiService.getBudgetProgress);

  return {
    // Budget methods
    getAllBudgets,
    getBudgetById,
    createBudget,
    updateBudget,
    deleteBudget,
    getBudgetProgress,
    
    // Loading states
    isGettingBudgets,
    isGettingBudget,
    isCreatingBudget,
    isUpdatingBudget,
    isDeletingBudget,
    isGettingProgress,
    
    // Error states
    getBudgetsError,
    getBudgetError,
    createBudgetError,
    updateBudgetError,
    deleteBudgetError,
    getProgressError,
    
    // Combined loading state
    isLoading: isGettingBudgets || isGettingBudget || isCreatingBudget || 
               isUpdatingBudget || isDeletingBudget || isGettingProgress,
  };
}

// Analytics Hook
export function useAnalytics() {
  const { execute: getDashboardSummary, isLoading: isGettingDashboard, error: getDashboardError } = 
    useApiCall(analyticsApiService.getDashboardSummary);
  
  const { execute: getSpendingAnalysis, isLoading: isGettingSpending, error: getSpendingError } = 
    useApiCall(analyticsApiService.getSpendingAnalysis);
  
  const { execute: getIncomeAnalysis, isLoading: isGettingIncome, error: getIncomeError } = 
    useApiCall(analyticsApiService.getIncomeAnalysis);
  
  const { execute: getCategoryBreakdown, isLoading: isGettingCategories, error: getCategoriesError } = 
    useApiCall(analyticsApiService.getCategoryBreakdown);
  
  const { execute: getMonthlyTrends, isLoading: isGettingTrends, error: getTrendsError } = 
    useApiCall(analyticsApiService.getMonthlyTrends);
  
  const { execute: getCashFlow, isLoading: isGettingCashFlow, error: getCashFlowError } = 
    useApiCall(analyticsApiService.getCashFlow);

  return {
    // Analytics methods
    getDashboardSummary,
    getSpendingAnalysis,
    getIncomeAnalysis,
    getCategoryBreakdown,
    getMonthlyTrends,
    getCashFlow,
    
    // Loading states
    isGettingDashboard,
    isGettingSpending,
    isGettingIncome,
    isGettingCategories,
    isGettingTrends,
    isGettingCashFlow,
    
    // Error states
    getDashboardError,
    getSpendingError,
    getIncomeError,
    getCategoriesError,
    getTrendsError,
    getCashFlowError,
    
    // Combined loading state
    isLoading: isGettingDashboard || isGettingSpending || isGettingIncome || 
               isGettingCategories || isGettingTrends || isGettingCashFlow,
  };
}

// Legacy compatibility - keeping existing API hook structure
export function useApi<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (
    apiCall: () => Promise<T>
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall();
      setData(result);
      
      return result;
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}
