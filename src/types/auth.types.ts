/**
 * Authentication Types
 * All types related to authentication flows
 */

import { ApiResponse } from "./api.types";

// Legacy User interface for backward compatibility
export interface User {
  id: string;
  email: string;
  name: string;
  currency: string;
  riskProfile: RiskProfile;
  savingsThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

// User Profile (New API Format)
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth?: string;
  occupation?: string;
  avatar?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  twoFactorEnabled: boolean;
  currency: string;
  timezone: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  currency: string;
  occupation?: string;
  annualIncome?: number;
  riskProfile?: RiskProfile;
  savingsThreshold?: number;
}

export interface OTPVerification {
  email: string;
  otp: string;
}

export enum RiskProfile {
  CONSERVATIVE = "conservative",
  BALANCED = "balanced",
  AGGRESSIVE = "aggressive",
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

// NEW API Authentication Requests
export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  acceptTerms: boolean;
  marketingConsent?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceInfo?: DeviceInfo;
}

export interface VerifyOTPRequest {
  email: string;
  otpCode: string;
  otpType: "email_verification" | "password_reset" | "two_factor";
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
  logoutAllDevices?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// NEW API Authentication Responses
export interface NewAuthResponse {
  user: UserProfile;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: "Bearer";
  };
  requiresOTP?: boolean;
  otpType?: "email_verification" | "two_factor";
}

export interface OTPResponse {
  message: string;
  expiresIn: number;
  canResend: boolean;
  resendAfter?: number;
}

// Device & Security
export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: "mobile" | "desktop" | "tablet";
  browser?: string;
  os?: string;
  ipAddress?: string;
  location?: {
    country: string;
    city: string;
  };
}

export interface SecurityEvent {
  id: string;
  type:
    | "login"
    | "logout"
    | "password_change"
    | "failed_login"
    | "suspicious_activity";
  description: string;
  deviceInfo: DeviceInfo;
  timestamp: string;
  ipAddress: string;
  location?: {
    country: string;
    city: string;
  };
}

// Profile Management
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  occupation?: string;
  avatar?: string;
  currency?: string;
  timezone?: string;
  language?: string;
}

export interface DeleteAccountRequest {
  password: string;
  reason?: string;
  feedback?: string;
}

// API Response Types
export type RegisterResponse = ApiResponse<{
  requiresOTP: boolean;
  message: string;
}>;
export type LoginResponse = ApiResponse<NewAuthResponse>;
export type VerifyOTPResponse = ApiResponse<NewAuthResponse>;
export type ForgotPasswordResponse = ApiResponse<OTPResponse>;
export type ResetPasswordResponse = ApiResponse<{ message: string }>;
export type RefreshTokenResponse = ApiResponse<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}>;
export type LogoutResponse = ApiResponse<{ message: string }>;
export type ProfileResponse = ApiResponse<UserProfile>;
export type UpdateProfileResponse = ApiResponse<UserProfile>;
export type ChangePasswordResponse = ApiResponse<{ message: string }>;
export type SecurityEventsResponse = ApiResponse<SecurityEvent[]>;
export type DeleteAccountResponse = ApiResponse<{ message: string }>;
