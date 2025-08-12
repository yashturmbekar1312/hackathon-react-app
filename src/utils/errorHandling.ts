// API Error handling and retry utilities
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public retryable?: boolean
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export interface ToastContextType {
  toasts: any[];
  addToast: (toast: any) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  showSuccess: (title: string, message?: string, duration?: number) => void;
  showError: (title: string, message?: string, duration?: number) => void;
  showWarning: (title: string, message?: string, duration?: number) => void;
  showInfo: (title: string, message?: string, duration?: number) => void;
}

export const handleApiError = (error: any, toast?: ToastContextType): AppError => {
  let appError: AppError;

  if (error.response) {
    // HTTP error response
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 400:
        appError = new AppError(
          data?.message || 'Invalid request. Please check your input.',
          'BAD_REQUEST',
          400,
          false
        );
        break;
      case 401:
        appError = new AppError(
          'Authentication required. Please log in again.',
          'UNAUTHORIZED',
          401,
          false
        );
        break;
      case 403:
        appError = new AppError(
          'You do not have permission to perform this action.',
          'FORBIDDEN',
          403,
          false
        );
        break;
      case 404:
        appError = new AppError(
          'The requested resource was not found.',
          'NOT_FOUND',
          404,
          false
        );
        break;
      case 409:
        appError = new AppError(
          data?.message || 'A conflict occurred. The resource may already exist.',
          'CONFLICT',
          409,
          false
        );
        break;
      case 422:
        appError = new AppError(
          data?.message || 'Validation failed. Please check your input.',
          'VALIDATION_ERROR',
          422,
          false
        );
        break;
      case 429:
        appError = new AppError(
          'Too many requests. Please try again later.',
          'RATE_LIMITED',
          429,
          true
        );
        break;
      case 500:
        appError = new AppError(
          'An internal server error occurred. Please try again.',
          'INTERNAL_ERROR',
          500,
          true
        );
        break;
      case 502:
      case 503:
      case 504:
        appError = new AppError(
          'Service temporarily unavailable. Please try again later.',
          'SERVICE_UNAVAILABLE',
          status,
          true
        );
        break;
      default:
        appError = new AppError(
          data?.message || `An error occurred (${status})`,
          'HTTP_ERROR',
          status,
          status >= 500
        );
    }
  } else if (error.request) {
    // Network error
    appError = new AppError(
      'Network error. Please check your internet connection.',
      'NETWORK_ERROR',
      0,
      true
    );
  } else {
    // Other error
    appError = new AppError(
      error.message || 'An unexpected error occurred',
      'UNKNOWN_ERROR',
      0,
      false
    );
  }

  // Show toast notification if available
  if (toast) {
    if (appError.status === 401) {
      toast.showError('Authentication Error', appError.message);
    } else if (appError.retryable) {
      toast.showWarning('Temporary Error', appError.message, 7000);
    } else {
      toast.showError('Error', appError.message);
    }
  }

  return appError;
};

// Retry utility with proper TypeScript generics
export const withRetry = async function<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
  toast?: ToastContextType
): Promise<T> {
  let lastError: Error = new Error('Max retries exceeded');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }

      // Check if error is retryable
      const isRetryable = error.retryable || 
                         error.status >= 500 || 
                         error.code === 'NETWORK_ERROR' ||
                         error.code === 'RATE_LIMITED';

      if (!isRetryable) {
        break;
      }

      if (toast) {
        toast.showInfo(
          'Retrying', 
          `Attempt ${attempt} failed. Retrying in ${delayMs / 1000} seconds...`,
          2000
        );
      }

      // Exponential backoff
      const delay = delayMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// Alternative function-based retry utility to avoid generic syntax issues
export const retryOperation = async (
  operation: () => Promise<any>,
  options: {
    maxRetries?: number;
    delayMs?: number;
    toast?: ToastContextType;
  } = {}
): Promise<any> => {
  const { maxRetries = 3, delayMs = 1000, toast } = options;
  let lastError: Error = new Error('Max retries exceeded');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }

      // Check if error is retryable
      const isRetryable = error.retryable || 
                         error.status >= 500 || 
                         error.code === 'NETWORK_ERROR' ||
                         error.code === 'RATE_LIMITED';

      if (!isRetryable) {
        break;
      }

      if (toast) {
        toast.showInfo(
          'Retrying', 
          `Attempt ${attempt} failed. Retrying in ${delayMs / 1000} seconds...`,
          2000
        );
      }

      // Exponential backoff
      const delay = delayMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};
