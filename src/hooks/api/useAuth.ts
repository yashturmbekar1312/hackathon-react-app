/**
 * Authentication Hooks
 * Professional React hooks for authentication flows
 */

import { useState, useEffect, useCallback } from 'react';
import { authApiService } from '../../api/endpoints/auth.api';
import { STORAGE_KEYS } from '../../api/config';
import {
  LoginRequest,
  RegisterRequest,
  VerifyOTPRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UserProfile,
  NewAuthResponse,
} from '../../types/auth.types';
import { LoadingState } from '../../types/api.types';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<NewAuthResponse>;
  register: (data: RegisterRequest) => Promise<void>;
  verifyOTP: (data: VerifyOTPRequest) => Promise<NewAuthResponse>;
  forgotPassword: (data: ForgotPasswordRequest) => Promise<void>;
  resetPassword: (data: ResetPasswordRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  resendOTP: (email: string, type?: 'email_verification' | 'password_reset') => Promise<void>;
  checkEmailExists: (email: string) => Promise<{ exists: boolean; isVerified: boolean }>;
}

export interface UseAuthReturn extends AuthState, AuthActions {}

export const useAuth = (): UseAuthReturn => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    isInitialized: false,
  });

  // Initialize auth state from storage
  const initializeAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const userProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);

      if (token && userProfile) {
        // Validate token with server
        const validation = await authApiService.validateToken();
        if (validation.valid) {
          setState(prev => ({
            ...prev,
            user: JSON.parse(userProfile),
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          }));
          return;
        }
      }

      // Clear invalid data
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);

      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      }));
    } catch (error) {
      console.error('Auth initialization error:', error);
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: 'Failed to initialize authentication',
      }));
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const setLoadingState = useCallback((loading: boolean, error?: string | null) => {
    setState(prev => ({
      ...prev,
      isLoading: loading,
      error: error ?? prev.error,
    }));
  }, []);

  const setAuthenticatedUser = useCallback((authResponse: NewAuthResponse) => {
    // Store tokens and user data
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authResponse.tokens.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authResponse.tokens.refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(authResponse.user));

    setState(prev => ({
      ...prev,
      user: authResponse.user,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    }));
  }, []);

  const clearAuthenticatedUser = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);

    setState(prev => ({
      ...prev,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    }));
  }, []);

  // Login
  const login = useCallback(async (credentials: LoginRequest): Promise<NewAuthResponse> => {
    setLoadingState(true);
    try {
      const response = await authApiService.login(credentials);
      
      if (response.success) {
        if (response.data.requiresOTP) {
          // OTP required, don't set authenticated state yet
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: null,
          }));
        } else {
          setAuthenticatedUser(response.data);
        }
        return response.data;
      }
      
      throw new Error(response.message);
    } catch (error: any) {
      setLoadingState(false, error.message || 'Login failed');
      throw error;
    }
  }, [setLoadingState, setAuthenticatedUser]);

  // Register
  const register = useCallback(async (data: RegisterRequest): Promise<void> => {
    setLoadingState(true);
    try {
      const response = await authApiService.register(data);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
        }));
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      setLoadingState(false, error.message || 'Registration failed');
      throw error;
    }
  }, [setLoadingState]);

  // Verify OTP
  const verifyOTP = useCallback(async (data: VerifyOTPRequest): Promise<NewAuthResponse> => {
    setLoadingState(true);
    try {
      const response = await authApiService.verifyOTP(data);
      
      if (response.success) {
        setAuthenticatedUser(response.data);
        return response.data;
      }
      
      throw new Error(response.message);
    } catch (error: any) {
      setLoadingState(false, error.message || 'OTP verification failed');
      throw error;
    }
  }, [setLoadingState, setAuthenticatedUser]);

  // Forgot Password
  const forgotPassword = useCallback(async (data: ForgotPasswordRequest): Promise<void> => {
    setLoadingState(true);
    try {
      const response = await authApiService.forgotPassword(data);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
        }));
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      setLoadingState(false, error.message || 'Failed to send reset email');
      throw error;
    }
  }, [setLoadingState]);

  // Reset Password
  const resetPassword = useCallback(async (data: ResetPasswordRequest): Promise<void> => {
    setLoadingState(true);
    try {
      const response = await authApiService.resetPassword(data);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
        }));
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      setLoadingState(false, error.message || 'Password reset failed');
      throw error;
    }
  }, [setLoadingState]);

  // Change Password
  const changePassword = useCallback(async (data: ChangePasswordRequest): Promise<void> => {
    setLoadingState(true);
    try {
      const response = await authApiService.changePassword(data);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
        }));
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      setLoadingState(false, error.message || 'Password change failed');
      throw error;
    }
  }, [setLoadingState]);

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    setLoadingState(true);
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (refreshToken) {
        await authApiService.logout({ refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthenticatedUser();
    }
  }, [setLoadingState, clearAuthenticatedUser]);

  // Refresh Token
  const refreshToken = useCallback(async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authApiService.refreshToken({ refreshToken });
      
      if (response.success) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      clearAuthenticatedUser();
      throw error;
    }
  }, [clearAuthenticatedUser]);

  // Clear Error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Resend OTP
  const resendOTP = useCallback(async (
    email: string, 
    type: 'email_verification' | 'password_reset' = 'email_verification'
  ): Promise<void> => {
    setLoadingState(true);
    try {
      await authApiService.resendOTP(email, type);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      setLoadingState(false, error.message || 'Failed to resend OTP');
      throw error;
    }
  }, [setLoadingState]);

  // Check Email Exists
  const checkEmailExists = useCallback(async (
    email: string
  ): Promise<{ exists: boolean; isVerified: boolean }> => {
    try {
      return await authApiService.checkEmailExists(email);
    } catch (error: any) {
      throw error;
    }
  }, []);

  return {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    isInitialized: state.isInitialized,
    
    // Actions
    login,
    register,
    verifyOTP,
    forgotPassword,
    resetPassword,
    changePassword,
    logout,
    refreshToken,
    clearError,
    resendOTP,
    checkEmailExists,
  };
};

// Registration Flow Hook
export const useRegistrationFlow = () => {
  const [state, setState] = useState<LoadingState & {
    step: 'email' | 'details' | 'otp' | 'complete';
    email?: string;
    requiresOTP?: boolean;
  }>({
    status: 'idle',
    error: null,
    step: 'email',
  });

  const { register, verifyOTP, resendOTP, checkEmailExists } = useAuth();

  const setStep = useCallback((step: typeof state.step) => {
    setState(prev => ({ ...prev, step }));
  }, []);

  const setLoading = useCallback((loading: boolean, error?: string | null) => {
    setState(prev => ({
      ...prev,
      status: loading ? 'loading' : 'idle',
      error: error ?? prev.error,
    }));
  }, []);

  const startRegistration = useCallback(async (data: RegisterRequest) => {
    setLoading(true);
    try {
      await register(data);
      setState(prev => ({
        ...prev,
        status: 'success',
        step: 'otp',
        email: data.email,
        requiresOTP: true,
        error: null,
      }));
    } catch (error: any) {
      setLoading(false, error.message);
      throw error;
    }
  }, [register, setLoading]);

  const verifyRegistrationOTP = useCallback(async (otpCode: string) => {
    if (!state.email) {
      throw new Error('No email found in registration flow');
    }

    setLoading(true);
    try {
      await verifyOTP({
        email: state.email,
        otpCode,
        otpType: 'email_verification',
      });
      setState(prev => ({
        ...prev,
        status: 'success',
        step: 'complete',
        error: null,
      }));
    } catch (error: any) {
      setLoading(false, error.message);
      throw error;
    }
  }, [state.email, verifyOTP, setLoading]);

  const resendRegistrationOTP = useCallback(async () => {
    if (!state.email) {
      throw new Error('No email found in registration flow');
    }

    setLoading(true);
    try {
      await resendOTP(state.email, 'email_verification');
      setLoading(false);
    } catch (error: any) {
      setLoading(false, error.message);
      throw error;
    }
  }, [state.email, resendOTP, setLoading]);

  const validateEmail = useCallback(async (email: string) => {
    try {
      const result = await checkEmailExists(email);
      return result;
    } catch (error: any) {
      throw error;
    }
  }, [checkEmailExists]);

  const resetFlow = useCallback(() => {
    setState({
      status: 'idle',
      error: null,
      step: 'email',
    });
  }, []);

  return {
    // State
    step: state.step,
    isLoading: state.status === 'loading',
    error: state.error,
    email: state.email,
    requiresOTP: state.requiresOTP,

    // Actions
    setStep,
    startRegistration,
    verifyRegistrationOTP,
    resendRegistrationOTP,
    validateEmail,
    resetFlow,
    clearError: () => setState(prev => ({ ...prev, error: null })),
  };
};
