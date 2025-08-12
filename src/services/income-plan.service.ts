/**
 * Income Plan Service
 * Direct API service implementation based on the provided API documentation
 */

import {
  IncomePlan,
  CreateIncomePlanRequest,
  UpdateIncomePlanRequest,
  IncomePlanSource,
  CreateIncomePlanSourceRequest,
  UpdateIncomePlanSourceRequest,
  IncomeEntry,
  CreateIncomeEntryRequest,
  IncomePlanMilestone,
  CreateMilestoneRequest,
  UpdateMilestoneRequest,
} from '../types/income.types';
import { API_BASE_URL, TOKEN_STORAGE_KEY } from '../utils/constants';

const BASE_URL = API_BASE_URL;

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

// Helper function to make API requests
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  const url = `${BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
};

class IncomePlanService {
  // 1. Create Income Plan
  async createIncomePlan(data: CreateIncomePlanRequest): Promise<IncomePlan> {
    return apiRequest<IncomePlan>('/income-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 2. Get All Income Plans
  async getIncomePlans(): Promise<IncomePlan[]> {
    return apiRequest<IncomePlan[]>('/income-plans');
  }

  // 3. Get Income Plan by ID
  async getIncomePlanById(id: string): Promise<IncomePlan> {
    return apiRequest<IncomePlan>(`/income-plans/${id}`);
  }

  // 4. Update Income Plan
  async updateIncomePlan(id: string, data: UpdateIncomePlanRequest): Promise<IncomePlan> {
    return apiRequest<IncomePlan>(`/income-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // 5. Delete Income Plan
  async deleteIncomePlan(id: string): Promise<void> {
    return apiRequest<void>(`/income-plans/${id}`, {
      method: 'DELETE',
    });
  }

  // 6. Add Income Source
  async addIncomeSource(planId: string, data: CreateIncomePlanSourceRequest): Promise<IncomePlanSource> {
    return apiRequest<IncomePlanSource>(`/income-plans/${planId}/sources`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 7. Get Income Sources
  async getIncomeSources(planId: string): Promise<IncomePlanSource[]> {
    return apiRequest<IncomePlanSource[]>(`/income-plans/${planId}/sources`);
  }

  // 8. Update Income Source
  async updateIncomeSource(
    planId: string,
    sourceId: string,
    data: UpdateIncomePlanSourceRequest
  ): Promise<IncomePlanSource> {
    return apiRequest<IncomePlanSource>(`/income-plans/${planId}/sources/${sourceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // 9. Delete Income Source
  async deleteIncomeSource(planId: string, sourceId: string): Promise<void> {
    return apiRequest<void>(`/income-plans/${planId}/sources/${sourceId}`, {
      method: 'DELETE',
    });
  }

  // 10. Record Income Entry
  async recordIncomeEntry(
    planId: string,
    sourceId: string,
    data: CreateIncomeEntryRequest
  ): Promise<IncomeEntry> {
    return apiRequest<IncomeEntry>(`/income-plans/${planId}/sources/${sourceId}/entries`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 11. Get Income Entries
  async getIncomeEntries(planId: string, sourceId: string): Promise<IncomeEntry[]> {
    return apiRequest<IncomeEntry[]>(`/income-plans/${planId}/sources/${sourceId}/entries`);
  }

  // 12. Add Income Plan Milestone
  async addMilestone(planId: string, data: CreateMilestoneRequest): Promise<IncomePlanMilestone> {
    return apiRequest<IncomePlanMilestone>(`/income-plans/${planId}/milestones`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 13. Get Income Plan Milestones
  async getMilestones(planId: string): Promise<IncomePlanMilestone[]> {
    return apiRequest<IncomePlanMilestone[]>(`/income-plans/${planId}/milestones`);
  }

  // 14. Update Milestone
  async updateMilestone(
    planId: string,
    milestoneId: string,
    data: UpdateMilestoneRequest
  ): Promise<IncomePlanMilestone> {
    return apiRequest<IncomePlanMilestone>(`/income-plans/${planId}/milestones/${milestoneId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // 15. Delete Milestone
  async deleteMilestone(planId: string, milestoneId: string): Promise<void> {
    return apiRequest<void>(`/income-plans/${planId}/milestones/${milestoneId}`, {
      method: 'DELETE',
    });
  }
}

export const incomePlanService = new IncomePlanService();
