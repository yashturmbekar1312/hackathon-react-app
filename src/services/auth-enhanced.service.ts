import { apiService } from './api-enhanced';
import { 
  AuthResponse, 
  LoginCredentials, 
  SignupData, 
  OTPVerification,
  User 
} from '../types/auth.types';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../utils/constants';

// Enhanced auth service with comprehensive error handling and token management
class EnhancedAuthService {
  private refreshTokenTimer: NodeJS.Timeout | null = null;

  // Register new user with enhanced validation
  async register(signupData: SignupData): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/register', signupData);
      
      if (response.token) {
        this.handleSuccessfulAuth(response);
      }
      
      return response;
    } catch (error: any) {
      throw this.formatAuthError(error, 'Registration failed');
    }
  }

  // Send OTP for email verification
  async sendOTP(email: string): Promise<{ message: string }> {
    try {
      return await apiService.post<{ message: string }>('/auth/send-otp', { email });
    } catch (error: any) {
      throw this.formatAuthError(error, 'Failed to send OTP');
    }
  }

  // Verify OTP
  async verifyOTP(otpData: OTPVerification): Promise<{ message: string; isValid: boolean }> {
    try {
      return await apiService.post<{ message: string; isValid: boolean }>('/auth/verify-otp', otpData);
    } catch (error: any) {
      throw this.formatAuthError(error, 'OTP verification failed');
    }
  }

  // Enhanced login with automatic token refresh setup
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/login', credentials);
      
      if (response.token) {
        this.handleSuccessfulAuth(response);
      }
      
      return response;
    } catch (error: any) {
      throw this.formatAuthError(error, 'Login failed');
    }
  }

  // Enhanced logout with proper cleanup
  async logout(): Promise<void> {
    try {
      // Clear refresh timer
      if (this.refreshTokenTimer) {
        clearTimeout(this.refreshTokenTimer);
        this.refreshTokenTimer = null;
      }

      // Call logout endpoint
      await apiService.post('/auth/logout');
    } catch (error) {
      } finally {
      // Always clear local storage
      this.clearAuthData();
    }
  }

  // Refresh token with automatic retry
  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiService.post<AuthResponse>('/auth/refresh', {
        refreshToken
      });

      if (response.token) {
        this.handleSuccessfulAuth(response);
      }

      return response;
    } catch (error: any) {
      this.clearAuthData();
      throw this.formatAuthError(error, 'Token refresh failed');
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const user = localStorage.getItem(USER_STORAGE_KEY);
    
    if (!token || !user) {
      return false;
    }

    // Check if token is expired (basic check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      
      if (payload.exp && payload.exp < now) {
        this.clearAuthData();
        return false;
      }
      
      return true;
    } catch (error) {
      this.clearAuthData();
      return false;
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(USER_STORAGE_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch (error) {
      return null;
    }
  }

  // Get current token
  getCurrentToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await apiService.put<User>('/auth/profile', userData);
      
      // Update stored user data
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response));
      
      return response;
    } catch (error: any) {
      throw this.formatAuthError(error, 'Profile update failed');
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    try {
      return await apiService.put<{ message: string }>('/auth/change-password', {
        currentPassword,
        newPassword
      });
    } catch (error: any) {
      throw this.formatAuthError(error, 'Password change failed');
    }
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      return await apiService.post<{ message: string }>('/auth/request-password-reset', { email });
    } catch (error: any) {
      throw this.formatAuthError(error, 'Password reset request failed');
    }
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      return await apiService.post<{ message: string }>('/auth/reset-password', {
        token,
        newPassword
      });
    } catch (error: any) {
      throw this.formatAuthError(error, 'Password reset failed');
    }
  }

  // Private helper methods
  private handleSuccessfulAuth(response: AuthResponse) {
    // Store tokens and user data
    localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
    
    if (response.refreshToken) {
      localStorage.setItem('refresh_token', response.refreshToken);
      apiService.setRefreshToken(response.refreshToken);
    }

    // Set up automatic token refresh
    this.setupTokenRefresh(response.token);
  }

  private setupTokenRefresh(token: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresIn = (payload.exp * 1000) - Date.now();
      
      // Refresh 5 minutes before expiry
      const refreshTime = Math.max(expiresIn - (5 * 60 * 1000), 60000);
      
      if (this.refreshTokenTimer) {
        clearTimeout(this.refreshTokenTimer);
      }

      this.refreshTokenTimer = setTimeout(() => {
        this.refreshToken().catch(() => {
          this.clearAuthData();
          window.location.href = '/login';
        });
      }, refreshTime);
    } catch (error) {
      }
  }

  private clearAuthData() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem('refresh_token');
    
    if (this.refreshTokenTimer) {
      clearTimeout(this.refreshTokenTimer);
      this.refreshTokenTimer = null;
    }
  }

  private formatAuthError(error: any, defaultMessage: string): Error {
    const message = error?.message || error?.response?.data?.message || defaultMessage;
    return new Error(message);
  }

  // Session management
  async validateSession(): Promise<boolean> {
    try {
      await apiService.get('/auth/validate');
      return true;
    } catch (error) {
      this.clearAuthData();
      return false;
    }
  }

  // Get user permissions
  async getUserPermissions(): Promise<string[]> {
    try {
      const response = await apiService.get<{ permissions: string[] }>('/auth/permissions');
      return response.permissions;
    } catch (error) {
      return [];
    }
  }
}

export const enhancedAuthService = new EnhancedAuthService();
export default enhancedAuthService;

