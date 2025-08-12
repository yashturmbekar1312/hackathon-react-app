import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL, TOKEN_STORAGE_KEY } from '../utils/constants';

// Types for API responses - Updated to match API specification
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

class ApiService {
  private api: AxiosInstance;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for logging and auth
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        console.log('🔍 API Interceptor - Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('✅ Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
        } else {
          console.warn('⚠️ No token found in localStorage, request will be unauthenticated');
        }

        // Log requests in development
        if (import.meta.env.DEV) {
          console.log(`🔵 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            data: config.data,
            params: config.params,
            headers: config.headers,
          });
        }

        return config;
      },
      (error) => {
        console.error('🔴 API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for token refresh and error handling
    this.api.interceptors.response.use(
      (response) => {
        // Log successful responses in development
        if (import.meta.env.DEV) {
          console.log(`🟢 API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data,
          });
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Handle token refresh for 401 errors
        if (error.response?.status === 401 && !originalRequest._retry) {
          console.error('🔴 401 Unauthorized Error:', {
            url: originalRequest.url,
            method: originalRequest.method,
            headers: originalRequest.headers,
            responseData: error.response.data,
          });
          
          const currentToken = localStorage.getItem(TOKEN_STORAGE_KEY);
          console.error('🔴 Current token in localStorage:', currentToken ? currentToken.substring(0, 20) + '...' : 'NO TOKEN');
          
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.api.request(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAccessToken();
            this.processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.api.request(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.handleAuthError();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Log errors in development
        if (import.meta.env.DEV) {
          console.error('🔴 API Response Error:', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.message,
            data: error.response?.data,
          });
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  private async refreshAccessToken(): Promise<string> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken: this.refreshToken,
      });
      
      const { token } = response.data;
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      return token;
    } catch (error) {
      throw new Error('Failed to refresh token');
    }
  }

  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  private handleAuthError() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem('wealthify_user');
    window.location.href = '/login';
  }

  private formatError(error: AxiosError): ApiError {
    const response = error.response;
    const responseData = response?.data as any;
    
    return {
      message: responseData?.message || error.message || 'An unexpected error occurred',
      status: response?.status || 500,
      code: responseData?.code,
    };
  }

  // Retry mechanism for failed requests
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        if (i === maxRetries) throw error;
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
    throw new Error('Max retries exceeded');
  }

  // Generic CRUD operations with retry logic
  async get<T>(url: string, params?: Record<string, any>, withRetry: boolean = true): Promise<T> {
    const requestFn = () => this.api.get<T>(url, { params }).then(response => response.data);
    return withRetry ? this.retryRequest(requestFn) : requestFn();
  }

  async post<T>(url: string, data?: any, withRetry: boolean = false): Promise<T> {
    const requestFn = () => this.api.post<T>(url, data).then(response => response.data);
    return withRetry ? this.retryRequest(requestFn) : requestFn();
  }

  async put<T>(url: string, data?: any, withRetry: boolean = false): Promise<T> {
    const requestFn = () => this.api.put<T>(url, data).then(response => response.data);
    return withRetry ? this.retryRequest(requestFn) : requestFn();
  }

  async delete<T>(url: string, withRetry: boolean = false): Promise<T> {
    const requestFn = () => this.api.delete<T>(url).then(response => response.data);
    return withRetry ? this.retryRequest(requestFn) : requestFn();
  }

  // Delete with data (for requests that need body in DELETE)
  async deleteWithData<T>(url: string, data?: any, withRetry: boolean = false): Promise<T> {
    const requestFn = () => this.api.delete<T>(url, { data }).then(response => response.data);
    return withRetry ? this.retryRequest(requestFn) : requestFn();
  }

  // Paginated requests
  async getPaginated<T>(
    url: string, 
    page: number = 1, 
    limit: number = 10, 
    params?: Record<string, any>
  ): Promise<PaginatedResponse<T>> {
    const allParams = { page, limit, ...params };
    return this.get<PaginatedResponse<T>>(url, allParams);
  }

  // Upload file with progress
  async uploadFile<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  // Set refresh token
  setRefreshToken(token: string) {
    this.refreshToken = token;
  }

  // Add patch method
  async patch<T>(url: string, data?: any, withRetry: boolean = false): Promise<T> {
    const requestFn = () => this.api.patch<T>(url, data).then(response => response.data);
    return withRetry ? this.retryRequest(requestFn) : requestFn();
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.get<{ status: string; timestamp: string }>('/health');
  }

  // Get axios instance for custom operations
  getAxiosInstance(): AxiosInstance {
    return this.api;
  }
}

export const apiService = new ApiService();
export default apiService;
