import { apiService } from './api';
import { ApiResponse } from '../types/api.types';
import { 
  AuthResponse, 
  LoginCredentials, 
  SignupData, 
  OTPVerification,
  User 
} from '../types/auth.types';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../utils/constants';

class AuthService {
  /**
   * Register new user
   * POST /auth/register
   */
  async register(signupData: SignupData): Promise<AuthResponse> {
    // Transform the data to match API expectations
    const apiPayload = {
      email: signupData.email,
      password: signupData.password,
      firstName: signupData.firstName,
      lastName: signupData.lastName,
      phoneNumber: signupData.phoneNumber || '',
      dateOfBirth: signupData.dateOfBirth || new Date().toISOString().split('T')[0],
      currency: signupData.currency || 'INR',
      occupation: signupData.occupation || ''
    };

    const response = await apiService.post<ApiResponse<{
      accessToken: string;
      refreshToken: string;
      expiresAt: string;
      user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phoneNumber?: string;
        isEmailVerified?: boolean;
      };
    }>>('/auth/register', apiPayload);
    
    // Extract the actual token and user from the response
    const apiData = response.data;
    const token = apiData.accessToken; // ← Use accessToken from API
    const apiUser = apiData.user;
    
    // Transform the API user format to match your app's User type
    const user = {
      id: apiUser.id,
      email: apiUser.email,
      name: `${apiUser.firstName} ${apiUser.lastName}`, // ← Combine firstName + lastName
      currency: 'INR', // ← Default values for missing fields
      riskProfile: 'balanced' as any,
      savingsThreshold: 50000,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Store token and user data
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
    
    // Return in the format expected by AuthContext
    return { user, token };
  }

  /**
   * Send OTP for email verification
   * POST /auth/send-otp
   */
  async sendOTP(email: string): Promise<{ message: string }> {
    const response = await apiService.post<ApiResponse<{ message: string }>>('/auth/send-otp', { email });
    return response.data;
  }

  /**
   * Verify OTP
   * POST /auth/verify-otp
   */
  async verifyOTP(otpData: OTPVerification): Promise<{ message: string; isValid: boolean }> {
    const response = await apiService.post<ApiResponse<{ message: string; isValid: boolean }>>('/auth/verify-otp', otpData);
    return response.data;
  }

  /**
   * Login user
   * POST /auth/login
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('🔐 AuthService: Login attempt with credentials:', { email: credentials.email });
    
    const response = await apiService.post<ApiResponse<{
      accessToken: string;
      refreshToken: string;
      expiresAt: string;
      user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phoneNumber?: string;
        isEmailVerified?: boolean;
      };
    }>>('/auth/login', credentials);
    
    console.log('🔐 AuthService: Login API response:', response);
    console.log('🔐 AuthService: Login data:', response.data);
    
    // Extract the actual token and user from the response
    const apiData = response.data;
    const token = apiData.accessToken; // ← Use accessToken from API
    const apiUser = apiData.user;
    
    // Transform the API user format to match your app's User type
    const user = {
      id: apiUser.id,
      email: apiUser.email,
      name: `${apiUser.firstName} ${apiUser.lastName}`, // ← Combine firstName + lastName
      currency: 'INR', // ← Default values for missing fields
      riskProfile: 'balanced' as any,
      savingsThreshold: 50000,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Store token and user data
    if (token) {
      console.log('💾 AuthService: Storing token:', token.substring(0, 20) + '...');
      console.log('💾 AuthService: Storing user:', user);
      
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      
      // Verify storage
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      console.log('✅ AuthService: Token stored successfully:', storedToken ? storedToken.substring(0, 20) + '...' : 'FAILED');
      console.log('✅ AuthService: User stored successfully:', storedUser ? JSON.parse(storedUser) : 'FAILED');
    } else {
      console.error('❌ AuthService: No token in response!', response.data);
    }
    
    // Return in the format expected by AuthContext
    return { user, token };
  }

  /**
   * Logout user
   * POST /auth/logout
   */
  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }

  /**
   * Get current user
   * GET /auth/me
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<ApiResponse<User>>('/auth/me');
    return response.data;
  }

  /**
   * Update user profile
   * PUT /auth/profile
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiService.patch<ApiResponse<User>>('/auth/profile', userData);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data));
    return response.data;
  }

  /**
   * Change password
   * PUT /auth/change-password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiService.put<ApiResponse<{ message: string }>>('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }

  /**
   * Forgot password
   * POST /auth/forgot-password
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiService.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
    return response.data;
  }

  /**
   * Reset password
   * POST /auth/reset-password
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiService.post<ApiResponse<{ message: string }>>('/auth/reset-password', {
      token,
      newPassword
    });
    return response.data;
  }

  /**
   * Refresh token
   * POST /auth/refresh
   */
  async refreshToken(): Promise<AuthResponse> {
    const response = await apiService.post<ApiResponse<AuthResponse>>('/auth/refresh');
    return response.data;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    return !!token;
  }

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  // Get stored user
  getStoredUser(): User | null {
    const userStr = localStorage.getItem(USER_STORAGE_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  // Mock functions for development (to be replaced with real API calls)
  async mockSendOTP(email: string): Promise<{ message: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Mock OTP sent to ${email}: 123456`);
    return { message: 'OTP sent successfully' };
  }

  async mockVerifyOTP(otpData: OTPVerification): Promise<{ message: string; isValid: boolean }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    const isValid = otpData.otp === '123456';
    return { 
      message: isValid ? 'OTP verified successfully' : 'Invalid OTP',
      isValid 
    };
  }

  async mockRegister(signupData: SignupData): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user: User = {
      id: `user_${Date.now()}`,
      email: signupData.email,
      name: `${signupData.firstName} ${signupData.lastName}`,
      currency: signupData.currency,
      riskProfile: signupData.riskProfile,
      savingsThreshold: signupData.savingsThreshold,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const token = `mock_token_${Date.now()}`;
    
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    
    return { user, token };
  }

  async mockLogin(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (credentials.email === 'demo@wealthify.com' && credentials.password === 'password') {
      const user: User = {
        id: 'user_demo',
        email: credentials.email,
        name: 'Demo User',
        currency: 'INR',
        riskProfile: 'balanced' as any,
        savingsThreshold: 50000,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const token = `mock_token_${Date.now()}`;
      
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      
      return { user, token };
    } else {
      throw new Error('Invalid credentials');
    }
  }
}

export const authService = new AuthService();
export default authService;
