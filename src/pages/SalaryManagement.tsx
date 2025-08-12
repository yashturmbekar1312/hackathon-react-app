import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { useSalary } from '../hooks/useSalary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { IncomePlanFormData, PayCycle } from '../types/salary.types';
import { toast } from 'sonner';

// Validation schema for income plan
const incomePlanValidationSchema = Yup.object({
  employer: Yup.string()
    .min(2, 'Employer name must be at least 2 characters')
    .max(100, 'Employer name must be less than 100 characters')
    .required('Employer name is required'),
  expectedNetSalary: Yup.number()
    .min(0, 'Salary must be a positive number')
    .max(10000000, 'Salary amount seems too high')
    .required('Expected salary is required'),
  currency: Yup.string()
    .oneOf(['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'], 'Please select a valid currency')
    .required('Currency is required'),
  payCycle: Yup.string()
    .oneOf([PayCycle.WEEKLY, PayCycle.BIWEEKLY, PayCycle.MONTHLY, PayCycle.QUARTERLY], 'Please select a valid pay cycle')
    .required('Pay cycle is required'),
  payDay: Yup.number()
    .min(1, 'Pay day must be between 1 and 31')
    .max(31, 'Pay day must be between 1 and 31')
    .integer('Pay day must be a whole number')
    .required('Pay day is required'),
});

const SalaryManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { activePlan, createIncomePlan, updateIncomePlan, isLoading, getNextPayDate, getMonthlyIncome } = useSalary();
  const [showForm, setShowForm] = useState(!activePlan);

  const initialFormData: IncomePlanFormData = {
    employer: activePlan?.employer || '',
    expectedNetSalary: activePlan?.expectedNetSalary || 0,
    payCycle: activePlan?.payCycle || PayCycle.MONTHLY,
    payDay: activePlan?.payDay || 1,
    currency: activePlan?.currency || user?.currency || 'USD',
  };

  const handleSubmit = async (values: IncomePlanFormData) => {
    try {
      if (activePlan) {
        await updateIncomePlan(activePlan.id, values);
      } else {
        await createIncomePlan(values);
      }
      toast.success(
        activePlan ? 'Income Plan Updated' : 'Income Plan Created',
        { description: 'Your salary information has been saved successfully.' }
      );
      setShowForm(false);
      
      // Suggest bank account setup for new plans
      if (!activePlan) {
        setTimeout(() => {
          toast.info(
            'Link Your Bank Account',
            { 
              description: 'Connect your bank account to automatically track salary deposits and expenses.',
              action: {
                label: 'Set up Account',
                onClick: () => navigate('/expenses')
              }
            }
          );
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to save income plan:', err);
      toast.error(
        'Failed to Save',
        { description: err instanceof Error ? err.message : 'Please try again.' }
      );
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
              <Formik
                initialValues={initialFormData}
                validationSchema={incomePlanValidationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="employer" className="text-sm font-medium text-gray-700">
                          Employer Name
                        </label>
                        <Field
                          as={Input}
                          id="employer"
                          name="employer"
                          type="text"
                          placeholder="Enter your employer name"
                          className={errors.employer && touched.employer ? 'border-red-500' : ''}
                        />
                        <ErrorMessage name="employer" component="div" className="text-sm text-red-600" />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="currency" className="text-sm font-medium text-gray-700">
                          Currency
                        </label>
                        <Field
                          as="select"
                          id="currency"
                          name="currency"
                          className={`w-full h-10 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.currency && touched.currency ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                          <option value="INR">INR - Indian Rupee</option>
                          <option value="CAD">CAD - Canadian Dollar</option>
                          <option value="AUD">AUD - Australian Dollar</option>
                        </Field>
                        <ErrorMessage name="currency" component="div" className="text-sm text-red-600" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="expectedNetSalary" className="text-sm font-medium text-gray-700">
                          Expected Net Salary
                        </label>
                        <Field
                          as={Input}
                          id="expectedNetSalary"
                          name="expectedNetSalary"
                          type="number"
                          placeholder="Enter your net salary"
                          min={0}
                          step={0.01}
                          className={errors.expectedNetSalary && touched.expectedNetSalary ? 'border-red-500' : ''}
                        />
                        <ErrorMessage name="expectedNetSalary" component="div" className="text-sm text-red-600" />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="payCycle" className="text-sm font-medium text-gray-700">
                          Pay Cycle
                        </label>
                        <Field
                          as="select"
                          id="payCycle"
                          name="payCycle"
                          className={`w-full h-10 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.payCycle && touched.payCycle ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value={PayCycle.WEEKLY}>Weekly</option>
                          <option value={PayCycle.BIWEEKLY}>Bi-weekly</option>
                          <option value={PayCycle.MONTHLY}>Monthly</option>
                          <option value={PayCycle.QUARTERLY}>Quarterly</option>
                        </Field>
                        <ErrorMessage name="payCycle" component="div" className="text-sm text-red-600" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="payDay" className="text-sm font-medium text-gray-700">
                        Pay Day (Day of Month)
                      </label>
                      <Field
                        as={Input}
                        id="payDay"
                        name="payDay"
                        type="number"
                        placeholder="Enter pay day (1-31)"
                        min={1}
                        max={31}
                        className={errors.payDay && touched.payDay ? 'border-red-500' : ''}
                      />
                      <ErrorMessage name="payDay" component="div" className="text-sm text-red-600" />
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
                        disabled={isSubmitting || isLoading}
                        className="flex-1"
                      >
                        {isLoading ? 'Saving...' : (activePlan ? 'Update Plan' : 'Create Plan')}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
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
