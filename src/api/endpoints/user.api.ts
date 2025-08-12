/**
 * User Management API Endpoints
 */

import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import {
  UpdateProfileRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
  ProfileResponse,
  UpdateProfileResponse,
  ChangePasswordResponse,
  DeleteAccountResponse,
} from '../../types/auth.types';

export class UserApiService {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<ProfileResponse> {
    return apiClient.get(API_ENDPOINTS.USERS.PROFILE);
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    return apiClient.put(API_ENDPOINTS.USERS.PROFILE, data);
  }

  /**
   * Change user password
   */
  async changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    return apiClient.put(API_ENDPOINTS.USERS.CHANGE_PASSWORD, data);
  }

  /**
   * Delete user account
   */
  async deleteAccount(data: DeleteAccountRequest): Promise<DeleteAccountResponse> {
    return apiClient.delete(API_ENDPOINTS.USERS.DELETE_ACCOUNT, { data });
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UpdateProfileResponse> {
    return apiClient.uploadFile(API_ENDPOINTS.USERS.UPLOAD_AVATAR, file, onProgress);
  }

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<{
    currency: string;
    timezone: string;
    language: string;
    dateFormat: string;
    numberFormat: string;
  }> {
    const response = await apiClient.get<{
      currency: string;
      timezone: string;
      language: string;
      dateFormat: string;
      numberFormat: string;
    }>('/users/preferences');
    return response.data;
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: {
    currency?: string;
    timezone?: string;
    language?: string;
    dateFormat?: string;
    numberFormat?: string;
  }) {
    return apiClient.put('/users/preferences', preferences);
  }
}

export const userApiService = new UserApiService();
