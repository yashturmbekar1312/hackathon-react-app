import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { salaryService } from '../services/salary.service';
import {
  SalaryPlan,
  SalaryReceipt,
  IncomePlanFormData,
  SalaryVerificationResult
} from '../types/salary.types';

export const useSalary = () => {
  const { user } = useAuth();
  const [salaryPlans, setSalaryPlans] = useState<SalaryPlan[]>([]);
  const [activePlan, setActivePlan] = useState<SalaryPlan | null>(null);
  const [salaryReceipts] = useState<SalaryReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch salary plans
  const fetchSalaryPlans = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const plans = await salaryService.mockGetSalaryPlans();
      setSalaryPlans(plans);
      
      const active = plans.find(plan => plan.isActive) || null;
      setActivePlan(active);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch salary plans');
    } finally {
      setIsLoading(false);
    }
  };

  // Create income plan
  const createIncomePlan = async (planData: IncomePlanFormData): Promise<SalaryPlan> => {
    try {
      setIsLoading(true);
      setError(null);
      const newPlan = await salaryService.mockCreateIncomePlan(planData);
      
      // Update local state
      setSalaryPlans(prev => [...prev, newPlan]);
      setActivePlan(newPlan);
      
      return newPlan;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create income plan';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Update income plan
  const updateIncomePlan = async (planId: string, planData: IncomePlanFormData): Promise<SalaryPlan> => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedPlan = await salaryService.mockUpdateIncomePlan(planId, planData);
      
      // Update local state
      setSalaryPlans(prev => prev.map(plan => plan.id === planId ? updatedPlan : plan));
      if (activePlan?.id === planId) {
        setActivePlan(updatedPlan);
      }
      
      return updatedPlan;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update income plan';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify salary receipt
  const verifySalaryReceipt = async (expectedDate: Date, actualAmount?: number): Promise<SalaryVerificationResult> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await salaryService.mockVerifySalaryReceipt(expectedDate, actualAmount);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify salary receipt';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Get next pay date
  const getNextPayDate = (): Date | null => {
    if (!activePlan) return null;
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    let nextPayDate = new Date(currentYear, currentMonth, activePlan.payDay);
    
    // If the pay day has passed this month, move to next month
    if (nextPayDate <= today) {
      nextPayDate = new Date(currentYear, currentMonth + 1, activePlan.payDay);
    }
    
    return nextPayDate;
  };

  // Calculate monthly income
  const getMonthlyIncome = (): number => {
    if (!activePlan) return 0;
    return salaryService.calculateMonthlyEquivalent(activePlan);
  };

  // Calculate annual income
  const getAnnualIncome = (): number => {
    if (!activePlan) return 0;
    return salaryService.calculateAnnualIncome(activePlan);
  };

  // Initialize data on mount
  useEffect(() => {
    fetchSalaryPlans();
  }, [user]);

  return {
    salaryPlans,
    activePlan,
    salaryReceipts,
    isLoading,
    error,
    createIncomePlan,
    updateIncomePlan,
    verifySalaryReceipt,
    fetchSalaryPlans,
    getNextPayDate,
    getMonthlyIncome,
    getAnnualIncome,
  };
};
