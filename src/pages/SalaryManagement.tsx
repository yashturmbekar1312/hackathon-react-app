import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSalary } from '../hooks/useSalary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { IncomePlanFormData, PayCycle } from '../types/salary.types';

const SalaryManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { activePlan, createIncomePlan, isLoading, error, getNextPayDate, getMonthlyIncome } = useSalary();
  const [showForm, setShowForm] = useState(!activePlan);
  const [formData, setFormData] = useState<IncomePlanFormData>({
    employer: '',
    expectedNetSalary: 0,
    payCycle: PayCycle.MONTHLY,
    payDay: 1,
    currency: user?.currency || 'USD',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'expectedNetSalary' || name === 'payDay'
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createIncomePlan(formData);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create income plan:', err);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Not set';
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Salary Management</h1>
            </div>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Plan Display */}
        {activePlan && !showForm && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Current Income Plan</CardTitle>
                <CardDescription>
                  Your active salary information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Plan Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Employer:</span>
                        <span className="font-medium">{activePlan.employer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Net Salary:</span>
                        <span className="font-medium">{formatCurrency(activePlan.expectedNetSalary)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pay Cycle:</span>
                        <span className="font-medium capitalize">{activePlan.payCycle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pay Day:</span>
                        <span className="font-medium">{activePlan.payDay}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Calculated Values</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Equivalent:</span>
                        <span className="font-medium">{formatCurrency(getMonthlyIncome())}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Next Pay Date:</span>
                        <span className="font-medium">{formatDate(getNextPayDate())}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowForm(true)}
                  >
                    Update Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Income Plan Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>
                {activePlan ? 'Update Income Plan' : 'Create Income Plan'}
              </CardTitle>
              <CardDescription>
                Enter your salary details and payment schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="employer" className="text-sm font-medium text-gray-700">
                      Employer Name
                    </label>
                    <Input
                      id="employer"
                      name="employer"
                      type="text"
                      placeholder="Enter your employer name"
                      value={formData.employer}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="currency" className="text-sm font-medium text-gray-700">
                      Currency
                    </label>
                    <Select
                      id="currency"
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="expectedNetSalary" className="text-sm font-medium text-gray-700">
                      Expected Net Salary
                    </label>
                    <Input
                      id="expectedNetSalary"
                      name="expectedNetSalary"
                      type="number"
                      placeholder="Enter your net salary"
                      value={formData.expectedNetSalary}
                      onChange={handleInputChange}
                      required
                      min={0}
                      step={0.01}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="payCycle" className="text-sm font-medium text-gray-700">
                      Pay Cycle
                    </label>
                    <Select
                      id="payCycle"
                      name="payCycle"
                      value={formData.payCycle}
                      onChange={handleInputChange}
                      required
                    >
                      <option value={PayCycle.WEEKLY}>Weekly</option>
                      <option value={PayCycle.BIWEEKLY}>Bi-weekly</option>
                      <option value={PayCycle.MONTHLY}>Monthly</option>
                      <option value={PayCycle.QUARTERLY}>Quarterly</option>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="payDay" className="text-sm font-medium text-gray-700">
                    Pay Day (Day of Month)
                  </label>
                  <Input
                    id="payDay"
                    name="payDay"
                    type="number"
                    placeholder="Enter pay day (1-31)"
                    value={formData.payDay}
                    onChange={handleInputChange}
                    required
                    min={1}
                    max={31}
                  />
                  <p className="text-xs text-gray-500">
                    Enter the day of the month you receive your salary (e.g., 15 for the 15th)
                  </p>
                </div>

                <div className="flex space-x-4">
                  {activePlan && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Saving...' : (activePlan ? 'Update Plan' : 'Create Plan')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Salary Verification Section */}
        {activePlan && !showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Salary Verification</CardTitle>
              <CardDescription>
                Track and verify your salary receipts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-6xl mb-4">💰</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Salary Verification Coming Soon
                </h3>
                <p className="text-gray-600 mb-4">
                  We'll automatically verify when your salary is received and alert you if there are any discrepancies.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-sm text-blue-700">
                    <strong>Next Expected Payment:</strong> {formatDate(getNextPayDate())}
                  </p>
                  <p className="text-sm text-blue-700">
                    <strong>Expected Amount:</strong> {formatCurrency(activePlan.expectedNetSalary)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default SalaryManagement;
