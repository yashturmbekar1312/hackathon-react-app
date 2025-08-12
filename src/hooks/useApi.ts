import { useState, useEffect } from 'react';
import { 
  authApiService, 
  userApiService,
  accountApiService,
  transactionApiService,
  budgetApiService,
  analyticsApiService
} from '../services';

import type {
  LoginRequest,
  RegisterRequest,
  UserProfile,
  Account,
  Transaction,
  Budget,
  DashboardSummary,
  TransactionFilters
} from '../services';

// Auth hooks
export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApiService.login(credentials);
      if (response.success) {
        localStorage.setItem('wealthify_token', response.data.token);
        localStorage.setItem('wealthify_refresh_token', response.data.refreshToken);
        localStorage.setItem('wealthify_user', JSON.stringify(response.data.user));
        return response.data;
      }
      throw new Error(response.message);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApiService.register(userData);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const refreshToken = localStorage.getItem('wealthify_refresh_token');
      if (refreshToken) {
        await authApiService.logout({ refreshToken });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('wealthify_token');
      localStorage.removeItem('wealthify_refresh_token');
      localStorage.removeItem('wealthify_user');
      setLoading(false);
    }
  };

  return { login, register, logout, loading, error };
};

// User profile hook
export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userApiService.getProfile();
      if (response.success) {
        setProfile(response.data);
        return response.data;
      }
      throw new Error(response.message);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, error, refetch: fetchProfile };
};

// Accounts hook
export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await accountApiService.getAllAccounts();
      if (response.success) {
        setAccounts(response.data);
        return response.data;
      }
      throw new Error(response.message);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch accounts');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return { accounts, loading, error, refetch: fetchAccounts };
};

// Transactions hook
export const useTransactions = (filters?: TransactionFilters) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await transactionApiService.getAllTransactions(filters);
      if (response.success) {
        setTransactions(response.data);
        return response.data;
      }
      throw new Error(response.message);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [JSON.stringify(filters)]);

  return { transactions, loading, error, refetch: fetchTransactions };
};

// Budgets hook
export const useBudgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await budgetApiService.getAllBudgets();
      if (response.success) {
        setBudgets(response.data);
        return response.data;
      }
      throw new Error(response.message);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch budgets');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  return { budgets, loading, error, refetch: fetchBudgets };
};

// Dashboard hook
export const useDashboard = () => {
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await analyticsApiService.getDashboardSummary();
      if (response.success) {
        setDashboard(response.data);
        return response.data;
      }
      throw new Error(response.message);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return { dashboard, loading, error, refetch: fetchDashboard };
};
