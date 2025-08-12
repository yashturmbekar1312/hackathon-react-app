/**
 * API Configuration
 * Central configuration for all API endpoints and settings
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://hackathon-dotnet-app-production-36f9.up.railway.app/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'wealthify_access_token',
  REFRESH_TOKEN: 'wealthify_refresh_token',
  USER_PROFILE: 'wealthify_user_profile',
  REMEMBER_ME: 'wealthify_remember_me',
} as const;

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    VERIFY_OTP: '/auth/verify-otp',
    LOGIN: '/auth/login',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // User Management
  USERS: {
    PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    DELETE_ACCOUNT: '/users/account',
    UPLOAD_AVATAR: '/users/avatar',
  },
  
  // Account Management
  ACCOUNTS: {
    BASE: '/accounts',
    BY_ID: (id: string) => `/accounts/${id}`,
    BALANCE_HISTORY: (id: string) => `/accounts/${id}/balance-history`,
  },
  
  // Transaction Management
  TRANSACTIONS: {
    BASE: '/transactions',
    BY_ID: (id: string) => `/transactions/${id}`,
    BULK: '/transactions/bulk',
    EXPORT: '/transactions/export',
    CATEGORIES: '/transactions/categories',
    SEARCH: '/transactions/search',
  },
  
  // Budget Management
  BUDGETS: {
    BASE: '/budgets',
    BY_ID: (id: string) => `/budgets/${id}`,
    PROGRESS: (id: string) => `/budgets/${id}/progress`,
    ALERTS: '/budgets/alerts',
  },
  
  // Analytics
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    SPENDING: '/analytics/spending',
    INCOME: '/analytics/income',
    CATEGORIES: '/analytics/categories',
    TRENDS: '/analytics/trends',
    CASHFLOW: '/analytics/cashflow',
    REPORTS: '/analytics/reports',
  },
  
  // Goals & Savings
  GOALS: {
    BASE: '/goals',
    BY_ID: (id: string) => `/goals/${id}`,
    PROGRESS: (id: string) => `/goals/${id}/progress`,
  },
  
  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    SETTINGS: '/notifications/settings',
  },
} as const;
