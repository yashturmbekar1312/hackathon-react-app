export interface SalaryPlan {
  id: string;
  userId: string;
  employer: string;
  expectedNetSalary: number;
  payCycle: PayCycle;
  payDay: number; // Day of month (1-31)
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SalaryReceipt {
  id: string;
  salaryPlanId: string;
  expectedAmount: number;
  actualAmount: number;
  expectedDate: Date;
  actualDate: Date;
  variance: number;
  isVerified: boolean;
  createdAt: Date;
}

export enum PayCycle {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly'
}

export interface IncomePlanFormData {
  employer: string;
  expectedNetSalary: number;
  payCycle: PayCycle;
  payDay: number;
  currency: string;
}

export interface SalaryVerificationResult {
  isReceived: boolean;
  variance: number;
  message: string;
  status: 'on-time' | 'late' | 'missing' | 'amount-mismatch';
}
