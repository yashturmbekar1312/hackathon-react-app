import React, { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useIncomePlans } from "../hooks/useIncomePlans";
import { useAuth } from "../context/AuthContext";
import { IncomeFrequency } from "../types/income.types";
import { toast } from "sonner";

interface SalaryData {
  baseSalary: number;
  allowances: number;
  deductions: number;
  payFrequency: IncomeFrequency;
  currency: string;
  employer: string;
  payDay: number;
}

const SalaryManagement: React.FC = () => {
  const { user } = useAuth();
  const { 
    incomePlans, 
    createIncomePlan, 
    updateIncomePlan, 
    fetchIncomePlans,
    addMilestone,
    deleteMilestone,
    fetchMilestones,
    milestones,
    isLoading 
  } = useIncomePlans();
  
  // Get the active income plan
  const activePlan = incomePlans.find(plan => plan.isActive) || null;
  
  const [salaryData, setSalaryData] = useState<SalaryData>({
    baseSalary: 0,
    allowances: 0,
    deductions: 0,
    payFrequency: "MONTHLY",
    currency: user?.currency || "INR",
    employer: "",
    payDay: 1,
  });

  const [isEditing, setIsEditing] = useState(!activePlan);
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    targetDate: "",
    priority: "medium" as "high" | "medium" | "low",
  });

  // Load milestones when active plan changes
  useEffect(() => {
    if (activePlan) {
      fetchMilestones(activePlan.id);
      setIsEditing(false);
    }
  }, [activePlan, fetchMilestones]);

  // Load income plans on mount and clean up old localStorage data
  useEffect(() => {
    // Remove old mock salary plans from localStorage
    localStorage.removeItem('mock_salary_plans');
    
    // Load new income plans
    fetchIncomePlans();
  }, [fetchIncomePlans]);

  const calculateNetSalary = () => {
    return salaryData.baseSalary + salaryData.allowances - salaryData.deductions;
  };

  const calculateMonthlySalary = () => {
    const netSalary = calculateNetSalary();
    switch (salaryData.payFrequency) {
      case "WEEKLY":
        return netSalary * 52 / 12;
      case "MONTHLY":
        return netSalary;
      case "QUARTERLY":
        return netSalary / 3;
      case "YEARLY":
        return netSalary / 12;
      default:
        return netSalary;
    }
  };

  const handleSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!salaryData.employer.trim()) {
      toast.error("Please enter your employer name");
      return;
    }

    if (salaryData.baseSalary <= 0) {
      toast.error("Please enter a valid base salary");
      return;
    }

    try {
      const currentYear = new Date().getFullYear();
      const monthlyEquivalent = calculateMonthlySalary();
      const targetAmount = monthlyEquivalent * 12; // Annual target

      if (activePlan) {
        // Update existing plan
        const updateData = {
          name: `${salaryData.employer} Income Plan`,
          description: `Income plan for ${salaryData.employer} - ${salaryData.payFrequency} salary`,
          targetAmount: targetAmount,
          startDate: new Date(currentYear, 0, 1).toISOString(),
          endDate: new Date(currentYear, 11, 31).toISOString(),
          isActive: true,
        };
        
        await updateIncomePlan(activePlan.id, updateData);
        toast.success("Income plan updated successfully!");
      } else {
        // Create new plan
        const createData = {
          name: `${salaryData.employer} Income Plan`,
          description: `Income plan for ${salaryData.employer} - ${salaryData.payFrequency} salary`,
          targetAmount: targetAmount,
          startDate: new Date(currentYear, 0, 1).toISOString(),
          endDate: new Date(currentYear, 11, 31).toISOString(),
          isActive: true,
        };
        
        await createIncomePlan(createData);
        
        // TODO: Create an income source for the salary
        // This would be done using addIncomeSource with the new plan ID
        
        toast.success("Income plan created successfully!");
      }
      
      setIsEditing(false);
    } catch (error: any) {
      console.error("Failed to save salary data:", error);
      toast.error(error.message || "Failed to save income information");
    }
  };

  const handleAddGoal = async () => {
    if (!activePlan) {
      toast.error("Please create an income plan first");
      return;
    }

    if (!newGoal.name.trim() || !newGoal.targetAmount || !newGoal.targetDate) {
      toast.error("Please fill in all goal details");
      return;
    }

    try {
      const milestoneData = {
        title: newGoal.name,
        description: `${newGoal.priority.toUpperCase()} priority savings goal`,
        targetAmount: parseFloat(newGoal.targetAmount),
        targetDate: new Date(newGoal.targetDate).toISOString(),
        isCompleted: false,
      };

      await addMilestone(activePlan.id, milestoneData);
      setNewGoal({ name: "", targetAmount: "", targetDate: "", priority: "medium" });
      toast.success("Savings goal added successfully!");
      
      // Refresh milestones
      fetchMilestones(activePlan.id);
    } catch (error: any) {
      console.error("Failed to add savings goal:", error);
      toast.error(error.message || "Failed to add savings goal");
    }
  };

  const handleDeleteGoal = async (milestoneId: string) => {
    if (!activePlan) return;

    try {
      await deleteMilestone(activePlan.id, milestoneId);
      toast.success("Savings goal removed");
      
      // Refresh milestones
      fetchMilestones(activePlan.id);
    } catch (error: any) {
      console.error("Failed to delete savings goal:", error);
      toast.error(error.message || "Failed to remove savings goal");
    }
  };

  const getProgressPercentage = () => {
    // Since milestones don't have currentAmount, we'll assume 0 progress for now
    // TODO: This could be enhanced to track actual progress
    return 0;
  };

  return (
    <AppLayout title="Income Management">
      <div className="space-y-6">
        {/* Salary Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Income Information</CardTitle>
                <p className="text-sm text-brand-muted mt-1">
                  Manage your salary and income details
                </p>
              </div>
              {!isEditing && activePlan && (
                <Button 
                  variant="secondary" 
                  onClick={() => setIsEditing(true)}
                >
                  Edit Details
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSalarySubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">
                      Employer
                    </label>
                    <Input
                      type="text"
                      value={salaryData.employer}
                      onChange={(e) => setSalaryData({...salaryData, employer: e.target.value})}
                      placeholder="Company name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">
                      Currency
                    </label>
                    <select
                      value={salaryData.currency}
                      onChange={(e) => setSalaryData({...salaryData, currency: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    >
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">
                      Base Salary
                    </label>
                    <Input
                      type="number"
                      value={salaryData.baseSalary || ""}
                      onChange={(e) => setSalaryData({...salaryData, baseSalary: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">
                      Allowances
                    </label>
                    <Input
                      type="number"
                      value={salaryData.allowances || ""}
                      onChange={(e) => setSalaryData({...salaryData, allowances: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">
                      Deductions
                    </label>
                    <Input
                      type="number"
                      value={salaryData.deductions || ""}
                      onChange={(e) => setSalaryData({...salaryData, deductions: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">
                      Pay Frequency
                    </label>
                    <select
                      value={salaryData.payFrequency}
                      onChange={(e) => setSalaryData({...salaryData, payFrequency: e.target.value as IncomeFrequency})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    >
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="QUARTERLY">Quarterly</option>
                      <option value="YEARLY">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">
                      Pay Day of Month
                    </label>
                    <Input
                      type="number"
                      value={salaryData.payDay || ""}
                      onChange={(e) => setSalaryData({...salaryData, payDay: parseInt(e.target.value) || 1})}
                      min="1"
                      max="31"
                      placeholder="1"
                    />
                  </div>
                </div>

                <div className="bg-brand-primary-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-brand-dark">Net Salary per pay period:</span>
                    <span className="text-xl font-bold text-brand-primary">
                      {salaryData.currency} {calculateNetSalary().toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-brand-muted">Monthly equivalent:</span>
                    <span className="font-semibold text-brand-dark">
                      {salaryData.currency} {calculateMonthlySalary().toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                  {activePlan && (
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-800">Income Plan</h3>
                    <p className="text-xl font-bold text-blue-900">{activePlan?.name || "Not set"}</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-green-800">Target Amount</h3>
                    <p className="text-xl font-bold text-green-900">
                      {salaryData.currency} {activePlan?.targetAmount?.toLocaleString() || "0"}
                    </p>
                    <p className="text-xs text-green-700">Annual</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-purple-800">Current Progress</h3>
                    <p className="text-xl font-bold text-purple-900">
                      {salaryData.currency} {activePlan?.currentAmount?.toLocaleString() || "0"}
                    </p>
                    <p className="text-xs text-purple-700">
                      {activePlan ? ((activePlan.currentAmount / activePlan.targetAmount) * 100).toFixed(1) : 0}% complete
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-orange-800">Status</h3>
                    <p className="text-xl font-bold text-orange-900">
                      {activePlan?.isActive ? "Active" : "Inactive"}
                    </p>
                    <p className="text-xs text-orange-700">Income plan</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Savings Goals */}
        <Card>
          <CardHeader>
            <CardTitle>Savings Goals</CardTitle>
            <p className="text-sm text-brand-muted">
              Set and track your financial savings targets
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Add New Goal Form */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h3 className="font-medium text-brand-dark">Add New Savings Goal</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input
                    type="text"
                    placeholder="Goal name"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                  />
                  <Input
                    type="number"
                    placeholder="Target amount"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})}
                    min="0"
                    step="0.01"
                  />
                  <Input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                  />
                  <div className="flex space-x-2">
                    <select
                      value={newGoal.priority}
                      onChange={(e) => setNewGoal({...newGoal, priority: e.target.value as any})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                    <Button onClick={handleAddGoal}>Add</Button>
                  </div>
                </div>
              </div>

              {/* Goals List */}
              {milestones.length > 0 ? (
                <div className="space-y-4">
                  {milestones.map((milestone) => (
                    <div key={milestone.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-medium text-brand-dark">{milestone.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${milestone.isCompleted ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'}`}>
                            {milestone.isCompleted ? 'COMPLETED' : 'IN PROGRESS'}
                          </span>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDeleteGoal(milestone.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-brand-muted">Progress</span>
                          <span className="font-medium">
                            {salaryData.currency} 0 / {milestone.targetAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-brand-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getProgressPercentage()}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-brand-muted">
                          <span>{getProgressPercentage().toFixed(1)}% complete</span>
                          <span>Target: {new Date(milestone.targetDate).toLocaleDateString()}</span>
                        </div>
                        {milestone.description && (
                          <p className="text-sm text-brand-muted mt-2">{milestone.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-brand-muted">
                  <p>No savings goals set yet.</p>
                  <p className="text-sm">Add your first goal above to start tracking your progress!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SalaryManagement;
