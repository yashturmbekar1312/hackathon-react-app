/**
 * Income Plan API Service
 * Service for managing income plans, sources, entries, and milestones
 */

import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
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
} from '../../types/income.types';

class IncomePlanApiService {
  // Income Plan Management
  async createIncomePlan(data: CreateIncomePlanRequest): Promise<IncomePlan> {
    const response = await apiClient.post<IncomePlan>(
      API_ENDPOINTS.INCOME_PLANS.BASE,
      data
    );
    return response.data;
  }

  async getIncomePlans(): Promise<IncomePlan[]> {
    const response = await apiClient.get<IncomePlan[]>(
      API_ENDPOINTS.INCOME_PLANS.BASE
    );
    return response.data;
  }

  async getIncomePlanById(id: string): Promise<IncomePlan> {
    const response = await apiClient.get<IncomePlan>(
      API_ENDPOINTS.INCOME_PLANS.BY_ID(id)
    );
    return response.data;
  }

  async updateIncomePlan(id: string, data: UpdateIncomePlanRequest): Promise<IncomePlan> {
    const response = await apiClient.put<IncomePlan>(
      API_ENDPOINTS.INCOME_PLANS.BY_ID(id),
      data
    );
    return response.data;
  }

  async deleteIncomePlan(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.INCOME_PLANS.BY_ID(id));
  }

  // Income Source Management
  async addIncomeSource(planId: string, data: CreateIncomePlanSourceRequest): Promise<IncomePlanSource> {
    const response = await apiClient.post<IncomePlanSource>(
      API_ENDPOINTS.INCOME_PLANS.SOURCES(planId),
      data
    );
    return response.data;
  }

  async getIncomeSources(planId: string): Promise<IncomePlanSource[]> {
    const response = await apiClient.get<IncomePlanSource[]>(
      API_ENDPOINTS.INCOME_PLANS.SOURCES(planId)
    );
    return response.data;
  }

  async updateIncomeSource(
    planId: string,
    sourceId: string,
    data: UpdateIncomePlanSourceRequest
  ): Promise<IncomePlanSource> {
    const response = await apiClient.put<IncomePlanSource>(
      API_ENDPOINTS.INCOME_PLANS.SOURCE_BY_ID(planId, sourceId),
      data
    );
    return response.data;
  }

  async deleteIncomeSource(planId: string, sourceId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.INCOME_PLANS.SOURCE_BY_ID(planId, sourceId));
  }

  // Income Entry Management
  async recordIncomeEntry(
    planId: string,
    sourceId: string,
    data: CreateIncomeEntryRequest
  ): Promise<IncomeEntry> {
    const response = await apiClient.post<IncomeEntry>(
      API_ENDPOINTS.INCOME_PLANS.ENTRIES(planId, sourceId),
      data
    );
    return response.data;
  }

  async getIncomeEntries(planId: string, sourceId: string): Promise<IncomeEntry[]> {
    const response = await apiClient.get<IncomeEntry[]>(
      API_ENDPOINTS.INCOME_PLANS.ENTRIES(planId, sourceId)
    );
    return response.data;
  }

  // Milestone Management
  async addMilestone(planId: string, data: CreateMilestoneRequest): Promise<IncomePlanMilestone> {
    const response = await apiClient.post<IncomePlanMilestone>(
      API_ENDPOINTS.INCOME_PLANS.MILESTONES(planId),
      data
    );
    return response.data;
  }

  async getMilestones(planId: string): Promise<IncomePlanMilestone[]> {
    const response = await apiClient.get<IncomePlanMilestone[]>(
      API_ENDPOINTS.INCOME_PLANS.MILESTONES(planId)
    );
    return response.data;
  }

  async updateMilestone(
    planId: string,
    milestoneId: string,
    data: UpdateMilestoneRequest
  ): Promise<IncomePlanMilestone> {
    const response = await apiClient.put<IncomePlanMilestone>(
      API_ENDPOINTS.INCOME_PLANS.MILESTONE_BY_ID(planId, milestoneId),
      data
    );
    return response.data;
  }

  async deleteMilestone(planId: string, milestoneId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.INCOME_PLANS.MILESTONE_BY_ID(planId, milestoneId));
  }
}

export const incomePlanApiService = new IncomePlanApiService();
