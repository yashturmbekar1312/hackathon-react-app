/**
 * Income Plan Types
 * All types related to income planning and management
 */

// Income Source Types
export type IncomeSourceType = 'SALARY' | 'FREELANCE' | 'BUSINESS' | 'INVESTMENT' | 'RENTAL' | 'OTHER';

// Frequency Options
export type IncomeFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

// Core Income Plan Interface
export interface IncomePlan {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Create Income Plan Request
export interface CreateIncomePlanRequest {
  name: string;
  description: string;
  targetAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// Update Income Plan Request
export interface UpdateIncomePlanRequest {
  name?: string;
  description?: string;
  targetAmount?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

// Income Source Interface
export interface IncomePlanSource {
  id: string;
  incomePlanId: string;
  name: string;
  type: IncomeSourceType;
  expectedAmount: number;
  actualAmount: number;
  frequency: IncomeFrequency;
  startDate: string;
  endDate: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Create Income Source Request
export interface CreateIncomePlanSourceRequest {
  name: string;
  type: IncomeSourceType;
  expectedAmount: number;
  frequency: IncomeFrequency;
  startDate: string;
  endDate: string;
  description: string;
  isActive: boolean;
}

// Update Income Source Request
export interface UpdateIncomePlanSourceRequest {
  name?: string;
  type?: IncomeSourceType;
  expectedAmount?: number;
  frequency?: IncomeFrequency;
  startDate?: string;
  endDate?: string;
  description?: string;
  isActive?: boolean;
}

// Income Entry Interface
export interface IncomeEntry {
  id: string;
  incomeSourceId: string;
  amount: number;
  receivedDate: string;
  description: string;
  transactionReference?: string;
  createdAt: string;
  updatedAt: string;
}

// Create Income Entry Request
export interface CreateIncomeEntryRequest {
  amount: number;
  receivedDate: string;
  description: string;
  transactionReference?: string;
}

// Income Plan Milestone Interface
export interface IncomePlanMilestone {
  id: string;
  incomePlanId: string;
  title: string;
  description: string;
  targetAmount: number;
  targetDate: string;
  isCompleted: boolean;
  completedDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Create Milestone Request
export interface CreateMilestoneRequest {
  title: string;
  description: string;
  targetAmount: number;
  targetDate: string;
  isCompleted: boolean;
}

// Update Milestone Request
export interface UpdateMilestoneRequest {
  title?: string;
  description?: string;
  targetAmount?: number;
  targetDate?: string;
  isCompleted?: boolean;
  completedDate?: string;
}

// API Response Types
export interface IncomePlanResponse {
  data: IncomePlan;
  success: boolean;
  message?: string;
}

export interface IncomePlansResponse {
  data: IncomePlan[];
  success: boolean;
  message?: string;
}

export interface IncomePlanSourceResponse {
  data: IncomePlanSource;
  success: boolean;
  message?: string;
}

export interface IncomePlanSourcesResponse {
  data: IncomePlanSource[];
  success: boolean;
  message?: string;
}

export interface IncomeEntryResponse {
  data: IncomeEntry;
  success: boolean;
  message?: string;
}

export interface IncomeEntriesResponse {
  data: IncomeEntry[];
  success: boolean;
  message?: string;
}

export interface MilestoneResponse {
  data: IncomePlanMilestone;
  success: boolean;
  message?: string;
}

export interface MilestonesResponse {
  data: IncomePlanMilestone[];
  success: boolean;
  message?: string;
}
