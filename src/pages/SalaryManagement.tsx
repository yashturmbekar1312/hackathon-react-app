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
import { useSalary } from "../hooks/useSalary";
import { useAuth } from "../context/AuthContext";
import { PayCycle } from "../types/salary.types";
import { toast } from "sonner";

interface SalaryData {
  baseSalary: number;
  allowances: number;
  deductions: number;
  payFrequency: "monthly" | "biweekly" | "weekly";
  currency: string;
  employer: string;
  payDay: number;
}

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  priority: "high" | "medium" | "low";
}

const SalaryManagement: React.FC = () => {
  const { user } = useAuth();
  const { activePlan, createIncomePlan, updateIncomePlan, isLoading } = useSalary();
  
  const [salaryData, setSalaryData] = useState<SalaryData>({
    baseSalary: activePlan?.expectedNetSalary || 0,
    allowances: 0,
    deductions: 0,
    payFrequency: "monthly",
    currency: user?.currency || "USD",
    employer: activePlan?.employer || "",
    payDay: activePlan?.payDay || 1,
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [isEditing, setIsEditing] = useState(!activePlan);
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    targetDate: "",
    priority: "medium" as "high" | "medium" | "low",
  });

  useEffect(() => {
    if (activePlan) {
      setSalaryData({
        baseSalary: activePlan.expectedNetSalary,
        allowances: 0,
        deductions: 0,
        payFrequency: activePlan.payCycle === PayCycle.MONTHLY ? "monthly" : 
                      activePlan.payCycle === PayCycle.BIWEEKLY ? "biweekly" : "weekly",
        currency: activePlan.currency,
        employer: activePlan.employer,
        payDay: activePlan.payDay,
      });
    }
  }, [activePlan]);

  const calculateNetSalary = () => {
    return salaryData.baseSalary + salaryData.allowances - salaryData.deductions;
  };

  const calculateMonthlySalary = () => {
    const netSalary = calculateNetSalary();
    switch (salaryData.payFrequency) {
      case "weekly":
        return netSalary * 52 / 12;
      case "biweekly":
        return netSalary * 26 / 12;
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
      const planData = {
        employer: salaryData.employer,
        expectedNetSalary: calculateNetSalary(),
        payCycle: salaryData.payFrequency.toUpperCase() as any,
        payDay: salaryData.payDay,
        currency: salaryData.currency,
      };

      if (activePlan) {
        await updateIncomePlan(activePlan.id, planData);
        toast.success("Salary information updated successfully!");
      } else {
        await createIncomePlan(planData);
        toast.success("Salary information saved successfully!");
      }
      
      setIsEditing(false);
    } catch (error: any) {
      console.error("Failed to save salary data:", error);
      toast.error(error.message || "Failed to save salary information");
    }
  };

  const handleAddGoal = () => {
    if (!newGoal.name.trim() || !newGoal.targetAmount || !newGoal.targetDate) {
      toast.error("Please fill in all goal details");
      return;
    }

    const goal: SavingsGoal = {
      id: Date.now().toString(),
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: 0,
      targetDate: newGoal.targetDate,
      priority: newGoal.priority,
    };

    setSavingsGoals([...savingsGoals, goal]);
    setNewGoal({ name: "", targetAmount: "", targetDate: "", priority: "medium" });
    toast.success("Savings goal added successfully!");
  };

  const handleDeleteGoal = (goalId: string) => {
    setSavingsGoals(savingsGoals.filter(goal => goal.id !== goalId));
    toast.success("Savings goal removed");
  };

  const getProgressPercentage = (goal: SavingsGoal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
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
                      onChange={(e) => setSalaryData({...salaryData, payFrequency: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
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
                    <h3 className="text-sm font-medium text-blue-800">Employer</h3>
                    <p className="text-xl font-bold text-blue-900">{salaryData.employer || "Not set"}</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-green-800">Net Salary</h3>
                    <p className="text-xl font-bold text-green-900">
                      {salaryData.currency} {calculateNetSalary().toLocaleString()}
                    </p>
                    <p className="text-xs text-green-700 capitalize">{salaryData.payFrequency}</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-purple-800">Monthly Income</h3>
                    <p className="text-xl font-bold text-purple-900">
                      {salaryData.currency} {calculateMonthlySalary().toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-orange-800">Pay Day</h3>
                    <p className="text-xl font-bold text-orange-900">{salaryData.payDay}</p>
                    <p className="text-xs text-orange-700">of the month</p>
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
              {savingsGoals.length > 0 ? (
                <div className="space-y-4">
                  {savingsGoals.map((goal) => (
                    <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-medium text-brand-dark">{goal.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(goal.priority)}`}>
                            {goal.priority.toUpperCase()}
                          </span>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-brand-muted">Progress</span>
                          <span className="font-medium">
                            {salaryData.currency} {goal.currentAmount.toLocaleString()} / {goal.targetAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-brand-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getProgressPercentage(goal)}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-brand-muted">
                          <span>{getProgressPercentage(goal).toFixed(1)}% complete</span>
                          <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                        </div>
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
