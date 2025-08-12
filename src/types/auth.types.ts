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
  name: string;
  currency: string;
  riskProfile: RiskProfile;
  savingsThreshold: number;
}

export interface OTPVerification {
  email: string;
  otp: string;
}

export enum RiskProfile {
  CONSERVATIVE = 'conservative',
  BALANCED = 'balanced',
  AGGRESSIVE = 'aggressive'
}

export interface AuthResponse {
  user: User;
  token: string;
}
