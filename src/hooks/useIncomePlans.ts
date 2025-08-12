/**
 * useIncomePlans Hook
 * Custom hook for managing income plans, sources, entries, and milestones
 */

import { useState, useEffect, useCallback } from 'react';
import { incomePlanService } from '../services/income-plan.service';
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

export const useIncomePlans = () => {
  const [incomePlans, setIncomePlans] = useState<IncomePlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<IncomePlan | null>(null);
  const [incomeSources, setIncomeSources] = useState<IncomePlanSource[]>([]);
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
  const [milestones, setMilestones] = useState<IncomePlanMilestone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Income Plan Management
  const fetchIncomePlans = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const plans = await incomePlanService.getIncomePlans();
      setIncomePlans(plans);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch income plans');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createIncomePlan = useCallback(async (data: CreateIncomePlanRequest): Promise<IncomePlan | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const newPlan = await incomePlanService.createIncomePlan(data);
      setIncomePlans(prev => [...prev, newPlan]);
      return newPlan;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create income plan');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateIncomePlan = useCallback(async (id: string, data: UpdateIncomePlanRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedPlan = await incomePlanService.updateIncomePlan(id, data);
      setIncomePlans(prev => prev.map(plan => plan.id === id ? updatedPlan : plan));
      if (currentPlan?.id === id) {
        setCurrentPlan(updatedPlan);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update income plan');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentPlan?.id]);

  const deleteIncomePlan = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await incomePlanService.deleteIncomePlan(id);
      setIncomePlans(prev => prev.filter(plan => plan.id !== id));
      if (currentPlan?.id === id) {
        setCurrentPlan(null);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete income plan');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentPlan?.id]);

  const selectIncomePlan = useCallback(async (planId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const plan = await incomePlanService.getIncomePlanById(planId);
      setCurrentPlan(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch income plan');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Income Source Management
  const fetchIncomeSources = useCallback(async (planId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const sources = await incomePlanService.getIncomeSources(planId);
      setIncomeSources(sources);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch income sources');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addIncomeSource = useCallback(async (planId: string, data: CreateIncomePlanSourceRequest): Promise<IncomePlanSource | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const newSource = await incomePlanService.addIncomeSource(planId, data);
      setIncomeSources(prev => [...prev, newSource]);
      return newSource;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add income source');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateIncomeSource = useCallback(async (
    planId: string,
    sourceId: string,
    data: UpdateIncomePlanSourceRequest
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedSource = await incomePlanService.updateIncomeSource(planId, sourceId, data);
      setIncomeSources(prev => prev.map(source => source.id === sourceId ? updatedSource : source));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update income source');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteIncomeSource = useCallback(async (planId: string, sourceId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await incomePlanService.deleteIncomeSource(planId, sourceId);
      setIncomeSources(prev => prev.filter(source => source.id !== sourceId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete income source');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Income Entry Management
  const fetchIncomeEntries = useCallback(async (planId: string, sourceId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const entries = await incomePlanService.getIncomeEntries(planId, sourceId);
      setIncomeEntries(entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch income entries');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const recordIncomeEntry = useCallback(async (
    planId: string,
    sourceId: string,
    data: CreateIncomeEntryRequest
  ): Promise<IncomeEntry | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const newEntry = await incomePlanService.recordIncomeEntry(planId, sourceId, data);
      setIncomeEntries(prev => [...prev, newEntry]);
      return newEntry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record income entry');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Milestone Management
  const fetchMilestones = useCallback(async (planId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedMilestones = await incomePlanService.getMilestones(planId);
      setMilestones(fetchedMilestones);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch milestones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addMilestone = useCallback(async (planId: string, data: CreateMilestoneRequest): Promise<IncomePlanMilestone | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const newMilestone = await incomePlanService.addMilestone(planId, data);
      setMilestones(prev => [...prev, newMilestone]);
      return newMilestone;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add milestone');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateMilestone = useCallback(async (
    planId: string,
    milestoneId: string,
    data: UpdateMilestoneRequest
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedMilestone = await incomePlanService.updateMilestone(planId, milestoneId, data);
      setMilestones(prev => prev.map(milestone => milestone.id === milestoneId ? updatedMilestone : milestone));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update milestone');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteMilestone = useCallback(async (planId: string, milestoneId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await incomePlanService.deleteMilestone(planId, milestoneId);
      setMilestones(prev => prev.filter(milestone => milestone.id !== milestoneId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete milestone');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchIncomePlans();
  }, [fetchIncomePlans]);

  return {
    // State
    incomePlans,
    currentPlan,
    incomeSources,
    incomeEntries,
    milestones,
    isLoading,
    error,

    // Income Plan Actions
    fetchIncomePlans,
    createIncomePlan,
    updateIncomePlan,
    deleteIncomePlan,
    selectIncomePlan,

    // Income Source Actions
    fetchIncomeSources,
    addIncomeSource,
    updateIncomeSource,
    deleteIncomeSource,

    // Income Entry Actions
    fetchIncomeEntries,
    recordIncomeEntry,

    // Milestone Actions
    fetchMilestones,
    addMilestone,
    updateMilestone,
    deleteMilestone,
  };
};
