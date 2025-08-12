import { apiService } from './api';
import { ApiResponse } from '../types/api.types';

// User Management Types
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
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
  phoneNumber?: string;
  dateOfBirth?: string;
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
}

class UserApiService {
  /**
   * Get User Profile
   * GET /users/profile
   */
  async getProfile(): Promise<UserProfile> {
    const response = await apiService.get<ApiResponse<UserProfile>>('/users/profile');
    return response.data;
  }

  /**
   * Update User Profile
   * PUT /users/profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    const response = await apiService.put<ApiResponse<UserProfile>>('/users/profile', data);
    return response.data;
  }

  /**
   * Change Password
   * PUT /users/change-password
   */
  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await apiService.put<ApiResponse<{ message: string }>>('/users/change-password', data);
    return response.data;
  }

  /**
   * Delete Account
   * DELETE /users/account
   */
  async deleteAccount(data: DeleteAccountRequest): Promise<{ message: string }> {
    const response = await apiService.deleteWithData<ApiResponse<{ message: string }>>('/users/account', data);
    return response.data;
  }
}

export const userApiService = new UserApiService();
