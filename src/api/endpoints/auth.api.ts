/**
 * Authentication API Endpoints
 * Complete authentication flow implementation
 */

import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import {
  RegisterRequest,
  LoginRequest,
  VerifyOTPRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshTokenRequest,
  LogoutRequest,
  RegisterResponse,
  LoginResponse,
  VerifyOTPResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  RefreshTokenResponse,
  LogoutResponse,
} from '../../types/auth.types';

export class AuthApiService {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
  }

  /**
   * Verify OTP after registration or for two-factor authentication
   */
  async verifyOTP(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    return apiClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, data);
  }

  /**
   * Login user with email and password
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    return apiClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, data);
  }

  /**
   * Logout user and invalidate tokens
   */
  async logout(data: LogoutRequest): Promise<LogoutResponse> {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, data);
  }

  /**
   * Send forgot password email
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    return apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    return apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  }

  /**
   * Resend OTP for email verification
   */
  async resendOTP(email: string, otpType: 'email_verification' | 'password_reset' = 'email_verification') {
    return apiClient.post('/auth/resend-otp', { email, otpType });
  }

  /**
   * Check if email exists
   */
  async checkEmailExists(email: string): Promise<{ exists: boolean; isVerified: boolean }> {
    const response = await apiClient.post<{ exists: boolean; isVerified: boolean }>('/auth/check-email', { email });
    return response.data;
  }

  /**
   * Validate token
   */
  async validateToken(): Promise<{ valid: boolean; user?: any }> {
    const response = await apiClient.get<{ valid: boolean; user?: any }>('/auth/validate-token');
    return response.data;
  }

  /**
   * Change password (this endpoint might be in user service, but keeping here for auth flow)
   */
  async changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }) {
    return apiClient.put('/auth/change-password', data);
  }
}

export const authApiService = new AuthApiService();
