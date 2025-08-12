/**
 * Core API Client
 * Professional HTTP client with comprehensive error handling, retries, and interceptors
 */

import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError,
  InternalAxiosRequestConfig 
} from 'axios';
import { API_CONFIG, STORAGE_KEYS } from './config';
import { ApiResponse, ApiError } from '../types/api.types';

export class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request Interceptor
    this.client.interceptors.request.use(
      this.handleRequest.bind(this),
      this.handleRequestError.bind(this)
    );

    // Response Interceptor
    this.client.interceptors.response.use(
      this.handleResponse.bind(this),
      this.handleResponseError.bind(this)
    );
  }

  private handleRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    // Add auth token if available
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request metadata (extend the config type)
    const extendedConfig = config as InternalAxiosRequestConfig & { 
      metadata?: { startTime: number; requestId: string } 
    };
    
    extendedConfig.metadata = { 
      startTime: Date.now(),
      requestId: this.generateRequestId()
    };

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🔵 API Request [${extendedConfig.metadata.requestId}]:`, {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        params: config.params,
      });
    }

    return config;
  }

  private handleRequestError(error: AxiosError): Promise<AxiosError> {
    console.error('🔴 Request Error:', error);
    return Promise.reject(error);
  }

  private handleResponse(response: AxiosResponse): AxiosResponse {
    const config = response.config as InternalAxiosRequestConfig & { 
      metadata?: { startTime: number; requestId: string } 
    };
    const requestId = config.metadata?.requestId;
    const duration = Date.now() - (config.metadata?.startTime || 0);

    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`🟢 API Response [${requestId}] (${duration}ms):`, {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  }

  private async handleResponseError(error: AxiosError): Promise<any> {
    const config = error.config as any;
    const requestId = config?.metadata?.requestId;

    // Log error in development
    if (import.meta.env.DEV) {
      console.error(`🔴 API Error [${requestId}]:`, {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
      });
    }

    // Handle 401 Unauthorized - Token Refresh
    if (error.response?.status === 401 && !config?._retry) {
      return this.handleTokenRefresh(error);
    }

    // Handle network errors
    if (!error.response) {
      throw this.createApiError('Network error. Please check your connection.', 0);
    }

    // Handle other errors
    const responseData = error.response.data as any;
    const apiError = this.createApiError(
      responseData?.message || error.message || 'An unexpected error occurred',
      error.response.status,
      responseData?.errors
    );

    throw apiError;
  }

  private async handleTokenRefresh(error: AxiosError): Promise<any> {
    const originalRequest = error.config as any;

    if (this.isRefreshing) {
      // If already refreshing, queue the request
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      }).then(token => {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return this.client.request(originalRequest);
      }).catch(err => {
        return Promise.reject(err);
      });
    }

    originalRequest._retry = true;
    this.isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh-token`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data.data;

      // Store new tokens
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

      // Process queued requests
      this.processQueue(null, accessToken);

      // Retry original request
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }
      return this.client.request(originalRequest);

    } catch (refreshError) {
      this.processQueue(refreshError, null);
      this.handleAuthFailure();
      throw refreshError;
    } finally {
      this.isRefreshing = false;
    }
  }

  private processQueue(error: any, token: string | null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private handleAuthFailure(): void {
    // Clear all auth data
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);

    // Redirect to login (you can customize this)
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  private createApiError(message: string, status: number, errors?: any): ApiError {
    return {
      success: false,
      message,
      errors,
      code: status.toString(),
      timestamp: new Date().toISOString(),
    };
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Retry mechanism with exponential backoff (public method for external use)
  async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = API_CONFIG.RETRY_ATTEMPTS,
    delay: number = API_CONFIG.RETRY_DELAY
  ): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }

        // Don't retry on client errors (4xx) except 429 (Too Many Requests)
        if (error instanceof Error && 'response' in error) {
          const axiosError = error as AxiosError;
          const status = axiosError.response?.status;
          if (status && status >= 400 && status < 500 && status !== 429) {
            throw error;
          }
        }

        // Exponential backoff
        const backoffDelay = delay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }

    throw new Error('Max retries exceeded');
  }

  // Public HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // Utility methods
  async uploadFile<T>(
    url: string,
    file: File,
    progressCallback?: (progress: number) => void,
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const response = await this.client.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressCallback && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          progressCallback(progress);
        }
      },
    });

    return response.data;
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.get('/health');
  }

  // Get the underlying Axios instance if needed
  getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
