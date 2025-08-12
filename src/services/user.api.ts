import { apiService } from './api';
import { ApiResponse } from './api';

// User Management Types
export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountRequest {
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth?: string;
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
}

class UserApiService {
  // Get User Profile
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return apiService.get<ApiResponse<UserProfile>>('/users/profile');
  }

  // Update User Profile
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> {
    return apiService.put<ApiResponse<UserProfile>>('/users/profile', data);
  }

  // Change Password
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<void>> {
    return apiService.put<ApiResponse<void>>('/users/change-password', data);
  }

  // Delete Account
  async deleteAccount(data: DeleteAccountRequest): Promise<ApiResponse<void>> {
    return apiService.deleteWithData<ApiResponse<void>>('/users/account', data);
  }
}

export const userApiService = new UserApiService();
