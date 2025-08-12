import { apiService } from './api';
import { 
  AuthResponse, 
  LoginCredentials, 
  SignupData, 
  OTPVerification,
  User 
} from '../types/auth.types';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../utils/constants';

class AuthService {
  // Register new user
  async register(signupData: SignupData): Promise<AuthResponse> {
    return await apiService.post<AuthResponse>('/auth/register', signupData);
  }

  // Send OTP for email verification
  async sendOTP(email: string): Promise<{ message: string }> {
    return await apiService.post<{ message: string }>('/auth/send-otp', { email });
  }

  // Verify OTP
  async verifyOTP(otpData: OTPVerification): Promise<{ message: string; isValid: boolean }> {
    return await apiService.post<{ message: string; isValid: boolean }>('/auth/verify-otp', otpData);
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', credentials);
    
    // Store token and user data
    if (response.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
    }
    
    return response;
  }

  // Logout user
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

  // Get current user
  async getCurrentUser(): Promise<User> {
    return await apiService.get<User>('/auth/me');
  }

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiService.patch<User>('/auth/profile', userData);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response));
    return response;
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return await apiService.post<{ message: string }>('/auth/change-password', {
      currentPassword,
      newPassword
    });
  }

  // Forgot password
  async forgotPassword(email: string): Promise<{ message: string }> {
    return await apiService.post<{ message: string }>('/auth/forgot-password', { email });
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return await apiService.post<{ message: string }>('/auth/reset-password', {
      token,
      newPassword
    });
  }

  // Refresh token
  async refreshToken(): Promise<AuthResponse> {
    return await apiService.post<AuthResponse>('/auth/refresh');
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
      name: signupData.name,
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
        currency: 'USD',
        riskProfile: 'balanced' as any,
        savingsThreshold: 5000,
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
