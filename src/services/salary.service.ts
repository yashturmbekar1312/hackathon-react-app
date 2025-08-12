import { apiService } from './api';
import {
  SalaryPlan,
  SalaryReceipt,
  IncomePlanFormData,
  SalaryVerificationResult,
  PayCycle
} from '../types/salary.types';
import { getNextPayDate, isSalaryLate } from '../utils/helpers';

class SalaryService {
  // Create income plan
  async createIncomePlan(planData: IncomePlanFormData): Promise<SalaryPlan> {
    return await apiService.post<SalaryPlan>('/salary/plans', planData);
  }

  // Get user's salary plans
  async getSalaryPlans(): Promise<SalaryPlan[]> {
    return await apiService.get<SalaryPlan[]>('/salary/plans');
  }

  // Get active salary plan
  async getActiveSalaryPlan(): Promise<SalaryPlan | null> {
    const plans = await this.getSalaryPlans();
    return plans.find(plan => plan.isActive) || null;
  }

  // Update salary plan
  async updateSalaryPlan(planId: string, planData: Partial<SalaryPlan>): Promise<SalaryPlan> {
    return await apiService.patch<SalaryPlan>(`/salary/plans/${planId}`, planData);
  }

  // Delete salary plan
  async deleteSalaryPlan(planId: string): Promise<void> {
    await apiService.delete(`/salary/plans/${planId}`);
  }

  // Get salary receipts
  async getSalaryReceipts(planId?: string): Promise<SalaryReceipt[]> {
    const params = planId ? { planId } : {};
    return await apiService.get<SalaryReceipt[]>('/salary/receipts', params);
  }

  // Verify salary receipt
  async verifySalaryReceipt(receiptId: string): Promise<SalaryReceipt> {
    return await apiService.patch<SalaryReceipt>(`/salary/receipts/${receiptId}/verify`);
  }

  // Check if salary was received
  async checkSalaryReceipt(planId: string, expectedDate: Date): Promise<SalaryVerificationResult> {
    return await apiService.post<SalaryVerificationResult>('/salary/verify-receipt', {
      planId,
      expectedDate: expectedDate.toISOString()
    });
  }

  // Get next pay date for active plan
  async getNextPayDate(): Promise<Date | null> {
    const activePlan = await this.getActiveSalaryPlan();
    if (!activePlan) return null;
    
    return getNextPayDate(activePlan.payDay);
  }

  // Mock functions for development
  async mockCreateIncomePlan(planData: IncomePlanFormData): Promise<SalaryPlan> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const plan: SalaryPlan = {
      id: `plan_${Date.now()}`,
      userId: 'user_demo',
      employer: planData.employer,
      expectedNetSalary: planData.expectedNetSalary,
      payCycle: planData.payCycle,
      payDay: planData.payDay,
      currency: planData.currency,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store in localStorage for mock persistence
    const existingPlans = this.getMockPlans();
    existingPlans.push(plan);
    localStorage.setItem('mock_salary_plans', JSON.stringify(existingPlans));
    
    return plan;
  }

  async mockGetSalaryPlans(): Promise<SalaryPlan[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.getMockPlans();
  }

  async mockGetActiveSalaryPlan(): Promise<SalaryPlan | null> {
    const plans = await this.mockGetSalaryPlans();
    return plans.find(plan => plan.isActive) || null;
  }

  async mockVerifySalaryReceipt(expectedDate: Date, actualAmount?: number): Promise<SalaryVerificationResult> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const activePlan = await this.mockGetActiveSalaryPlan();
    if (!activePlan) {
      return {
        isReceived: false,
        variance: 0,
        message: 'No active salary plan found',
        status: 'missing'
      };
    }

    const isLate = isSalaryLate(expectedDate, 2);
    const receivedAmount = actualAmount || activePlan.expectedNetSalary;
    const variance = ((receivedAmount - activePlan.expectedNetSalary) / activePlan.expectedNetSalary) * 100;

    let status: SalaryVerificationResult['status'] = 'on-time';
    let message = 'Salary received on time';

    if (isLate) {
      status = 'late';
      message = 'Salary received late';
    }

    if (Math.abs(variance) > 5) {
      status = 'amount-mismatch';
      message = `Salary amount differs by ${Math.abs(variance).toFixed(1)}%`;
    }

    if (!receivedAmount) {
      status = 'missing';
      message = 'Salary not received yet';
    }

    return {
      isReceived: !!receivedAmount,
      variance,
      message,
      status
    };
  }

  private getMockPlans(): SalaryPlan[] {
    const plans = localStorage.getItem('mock_salary_plans');
    return plans ? JSON.parse(plans) : [];
  }

  // Calculate expected annual income
  calculateAnnualIncome(plan: SalaryPlan): number {
    switch (plan.payCycle) {
      case PayCycle.WEEKLY:
        return plan.expectedNetSalary * 52;
      case PayCycle.BIWEEKLY:
        return plan.expectedNetSalary * 26;
      case PayCycle.MONTHLY:
        return plan.expectedNetSalary * 12;
      case PayCycle.QUARTERLY:
        return plan.expectedNetSalary * 4;
      default:
        return plan.expectedNetSalary * 12;
    }
  }

  // Calculate monthly equivalent
  calculateMonthlyEquivalent(plan: SalaryPlan): number {
    switch (plan.payCycle) {
      case PayCycle.WEEKLY:
        return plan.expectedNetSalary * 4.33; // Average weeks per month
      case PayCycle.BIWEEKLY:
        return plan.expectedNetSalary * 2.17; // Average bi-weeks per month
      case PayCycle.MONTHLY:
        return plan.expectedNetSalary;
      case PayCycle.QUARTERLY:
        return plan.expectedNetSalary / 3;
      default:
        return plan.expectedNetSalary;
    }
  }
}

export const salaryService = new SalaryService();
export default salaryService;
