// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Authentication
export const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || 'your-secret-key';
export const TOKEN_STORAGE_KEY = 'wealthify_token';
export const USER_STORAGE_KEY = 'wealthify_user';

// OTP Configuration
export const OTP_EXPIRY_MINUTES = 10;
export const OTP_LENGTH = 6;

// Savings and Budget
export const DEFAULT_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'];
export const DEFAULT_BUDGET_ALERT_THRESHOLD = 80; // 80%
export const SAVINGS_LOW_ALERT_THRESHOLD = 0.9; // 90% of threshold

// Investment
export const INVESTMENT_SUGGESTION_CACHE_HOURS = 24;
export const MIN_INVESTMENT_AMOUNT = 100;

// Transaction Classification
export const CLASSIFICATION_CONFIDENCE_THRESHOLD = 0.8;
export const RECURRING_DETECTION_MIN_OCCURRENCES = 3;

// Alerts
export const SALARY_MISSING_GRACE_DAYS = 2;
export const BUDGET_NEAR_THRESHOLD = 80; // 80%
export const BUDGET_BREACH_THRESHOLD = 100; // 100%

// Date Formats
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';
export const DISPLAY_DATE_FORMAT = 'MMM dd, yyyy';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
