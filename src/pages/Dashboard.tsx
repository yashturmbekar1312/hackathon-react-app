import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSalary } from '../hooks/useSalary';
import { useExpenses } from '../hooks/useExpenses';
import { useInvestments } from '../hooks/useInvestments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import logo from "../assets/images/logo.png"

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { getMonthlyIncome, getNextPayDate } = useSalary();
  const { getTotalExpenses, getNetSavings, getBudgetAlerts } = useExpenses();
  const { calculateSavingsProjection, savingsProjection } = useInvestments();

  const [dashboardData, setDashboardData] = useState({
    monthlyIncome: 0,
    totalExpenses: 0,
    netSavings: 0,
    nextPayDate: null as Date | null,
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      const monthlyIncome = getMonthlyIncome();
      const totalExpenses = getTotalExpenses();
      const netSavings = getNetSavings();
      const nextPayDate = getNextPayDate();

      setDashboardData({
        monthlyIncome,
        totalExpenses,
        netSavings,
        nextPayDate,
      });

      // Calculate savings projection
      if (monthlyIncome > 0 && user?.savingsThreshold) {
        await calculateSavingsProjection(monthlyIncome, totalExpenses, user.savingsThreshold);
      }
    };

    loadDashboardData();
  }, [user]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Not set';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const budgetAlerts = getBudgetAlerts();
  const savingsRate = dashboardData.monthlyIncome > 0
    ? (dashboardData.netSavings / dashboardData.monthlyIncome) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {/* <h1 className="text-2xl font-bold text-gray-900">Wealthify</h1> */}
              <img src={logo} alt="logo" style={{ width: '150px', height: 'auto' }} />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name || 'User'}</span>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link to="/dashboard" className="border-b-2 border-blue-500 py-4 px-1 text-blue-600 font-medium">
              Dashboard
            </Link>
            <Link to="/salary" className="border-b-2 border-transparent py-4 px-1 text-gray-500 hover:text-gray-700">
              Salary
            </Link>
            <Link to="/expenses" className="border-b-2 border-transparent py-4 px-1 text-gray-500 hover:text-gray-700">
              Expenses
            </Link>
            <Link to="/investments" className="border-b-2 border-transparent py-4 px-1 text-gray-500 hover:text-gray-700">
              Investments
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {budgetAlerts.length > 0 && (
          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h3 className="text-lg font-medium text-yellow-800 mb-2">Budget Alerts</h3>
              {budgetAlerts.map((budget) => (
                <p key={budget.id} className="text-sm text-yellow-700">
                  {budget.category}: {((Math.abs(budget.spent) / budget.amount) * 100).toFixed(1)}% used
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(dashboardData.monthlyIncome)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(dashboardData.totalExpenses)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Net Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${dashboardData.netSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(dashboardData.netSavings)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {savingsRate.toFixed(1)}% savings rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Next Payday</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatDate(dashboardData.nextPayDate)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Savings Projection */}
        {savingsProjection && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Savings Projection</CardTitle>
                <CardDescription>
                  Projected savings for end of month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Savings:</span>
                    <span className="font-medium">{formatCurrency(savingsProjection.currentSavings)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Projected Month-End:</span>
                    <span className="font-medium">{formatCurrency(savingsProjection.projectedMonthEndSavings)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Surplus Available:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(savingsProjection.surplusAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Above Threshold:</span>
                    <span className={`font-medium ${savingsProjection.isAboveThreshold ? 'text-green-600' : 'text-red-600'}`}>
                      {savingsProjection.isAboveThreshold ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Manage your finances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/salary')}>
                    Set Income Plan
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/expenses')}>
                    Track Expenses
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/investments')}>
                    View Investment Suggestions
                  </Button>
                  {savingsProjection.surplusAmount > 0 && (
                    <Button className="w-full" onClick={() => navigate('/investments')}>
                      Invest Surplus ({formatCurrency(savingsProjection.surplusAmount)})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Get Started Section */}
        {dashboardData.monthlyIncome === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Get Started with Wealthify</CardTitle>
              <CardDescription>
                Set up your financial profile to start tracking and managing your wealth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 rounded-xl bg-gradient-to-b from-green-50 to-white shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="w-12 h-12 mx-auto mb-4 text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="8" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12" y2="16" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">Set Income Plan</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Add your salary details and payment schedule
                  </p>
                  <Button variant="outline" onClick={() => navigate('/salary')} className="w-full">
                    Setup Income
                  </Button>
                </div>
                <div className="text-center p-6 rounded-xl bg-gradient-to-b from-green-50 to-white shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="w-12 h-12 mx-auto mb-4 text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="20" x2="12" y2="10" />
                      <line x1="18" y1="20" x2="18" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="16" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">Track Expenses</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Import transactions and create budgets
                  </p>
                  <Button variant="outline" onClick={() => navigate('/expenses')} className="w-full">
                    Track Expenses
                  </Button>
                </div>
                <div className="text-center p-6 rounded-xl bg-gradient-to-b from-green-50 to-white shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="w-12 h-12 mx-auto mb-4 text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">Get Investment Ideas</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Receive AI-powered investment suggestions
                  </p>
                  <Button variant="outline" onClick={() => navigate('/investments')} className="w-full">
                    See Suggestions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
