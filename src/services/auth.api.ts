import { apiService } from './api';
import { ApiResponse } from './api';

// Authentication Types
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface VerifyOTPRequest {
  email: string;
  otpCode: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    isEmailVerified: boolean;
    createdAt: string;
    lastLoginAt: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
}

class AuthApiService {
  // Register User
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return apiService.post<ApiResponse<AuthResponse>>('/auth/register', data);
  }

  // Verify OTP
  async verifyOTP(data: VerifyOTPRequest): Promise<ApiResponse<AuthResponse>> {
    return apiService.post<ApiResponse<AuthResponse>>('/auth/verify-otp', data);
  }

  // Login
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return apiService.post<ApiResponse<AuthResponse>>('/auth/login', data);
  }

  // Refresh Token
  async refreshToken(data: RefreshTokenRequest): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
    return apiService.post<ApiResponse<{ token: string; refreshToken: string }>>('/auth/refresh-token', data);
  }

  // Logout
  async logout(data: LogoutRequest): Promise<ApiResponse<void>> {
    return apiService.post<ApiResponse<void>>('/auth/logout', data);
  }
}

export const authApiService = new AuthApiService();
