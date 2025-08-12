import { format, parseISO, isValid, addDays, addMonths, differenceInDays } from 'date-fns';
import { TransactionCategory, TransactionType } from '@/types/expense.types';

// Date formatting helpers
export const formatDate = (date: Date | string, formatString: string = 'MMM dd, yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? format(dateObj, formatString) : 'Invalid Date';
  } catch {
    return 'Invalid Date';
  }
};

// Currency formatting
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

// Percentage formatting
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

// Calculate percentage
export const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  return (part / total) * 100;
};

// Debounce function for search inputs
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Generate unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Get next pay date
export const getNextPayDate = (payDay: number, currentDate: Date = new Date()): Date => {
  const nextPayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), payDay);
  
  if (nextPayDate <= currentDate) {
    return addMonths(nextPayDate, 1);
  }
  
  return nextPayDate;
};

// Check if salary is late
export const isSalaryLate = (expectedDate: Date, graceDays: number = 2): boolean => {
  const now = new Date();
  const graceDate = addDays(expectedDate, graceDays);
  return now > graceDate;
};

// Calculate days until next pay
export const getDaysUntilNextPay = (nextPayDate: Date): number => {
  return differenceInDays(nextPayDate, new Date());
};

// Auto-classify transaction based on description
export const autoClassifyTransaction = (description: string): { category: TransactionCategory; type: TransactionType } => {
  const desc = description.toLowerCase();
  
  // Salary patterns
  if (desc.includes('salary') || desc.includes('payroll') || desc.includes('wage')) {
    return { category: TransactionCategory.SALARY, type: TransactionType.INCOME };
  }
  
  // Rent patterns
  if (desc.includes('rent') || desc.includes('lease')) {
    return { category: TransactionCategory.RENT, type: TransactionType.EXPENSE };
  }
  
  // Groceries patterns
  if (desc.includes('grocery') || desc.includes('supermarket') || desc.includes('food mart')) {
    return { category: TransactionCategory.GROCERIES, type: TransactionType.EXPENSE };
  }
  
  // Utilities patterns
  if (desc.includes('electric') || desc.includes('gas') || desc.includes('water') || desc.includes('utility')) {
    return { category: TransactionCategory.UTILITIES, type: TransactionType.EXPENSE };
  }
  
  // Transportation patterns
  if (desc.includes('uber') || desc.includes('taxi') || desc.includes('bus') || desc.includes('metro') || desc.includes('gas station')) {
    return { category: TransactionCategory.TRANSPORTATION, type: TransactionType.EXPENSE };
  }
  
  // Entertainment patterns
  if (desc.includes('netflix') || desc.includes('movie') || desc.includes('entertainment') || desc.includes('spotify')) {
    return { category: TransactionCategory.ENTERTAINMENT, type: TransactionType.EXPENSE };
  }
  
  // Default to other expense
  return { category: TransactionCategory.OTHER, type: TransactionType.EXPENSE };
};

// Calculate savings rate
export const calculateSavingsRate = (income: number, expenses: number): number => {
  if (income === 0) return 0;
  const savings = income - expenses;
  return (savings / income) * 100;
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// Deep clone object
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};
