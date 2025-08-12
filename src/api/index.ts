/**
 * API Services Index
 * Professional export of all API services and types
 */

// Core API
export { apiClient } from './client';
export { API_CONFIG, API_ENDPOINTS, STORAGE_KEYS } from './config';

// Import for internal use
import { STORAGE_KEYS } from './config';

// Endpoint Services
export { authApiService, AuthApiService } from './endpoints/auth.api';
export { userApiService, UserApiService } from './endpoints/user.api';
export { accountApiService, AccountApiService } from './endpoints/account.api';

// Types
export type * from '../types/api.types';
export type * from '../types/auth.types';
export type * from '../types/financial.types';

// Hooks
export { useAuth, useRegistrationFlow } from '../hooks/api/useAuth';

// Utility function for error handling
export const isApiError = (error: any): error is import('../types/api.types').ApiError => {
  return error && typeof error === 'object' && 'success' in error && error.success === false;
};

// Utility function for checking if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  return !!token;
};

// Utility function for getting stored user
export const getStoredUser = (): any | null => {
  const userString = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  if (userString) {
    try {
      return JSON.parse(userString);
    } catch {
      return null;
    }
  }
  return null;
};

// Utility function for clearing auth data
export const clearAuthData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
};
