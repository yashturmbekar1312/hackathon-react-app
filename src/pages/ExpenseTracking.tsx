import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useExpenses } from '@/hooks/useExpenses';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TransactionCategory, TransactionType } from '@/types/expense.types';

const ExpenseTracking: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    transactions, 
    budgets, 
    getTotalIncome, 
    getTotalExpenses, 
    getNetSavings,
    getSpendingByCategory,
    createBudget,
    addTransaction,
    isLoading
  } = useExpenses();

  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [budgetFormData, setBudgetFormData] = useState({
    category: TransactionCategory.GROCERIES,
    amount: 0,
    alertThreshold: 80,
  });
  const [transactionFormData, setTransactionFormData] = useState({
    description: '',
    amount: 0,
    category: TransactionCategory.OTHER,
    type: TransactionType.EXPENSE,
    date: new Date().toISOString().split('T')[0],
  });

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
    }).format(amount);
  };

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      // Create start and end dates for the current month
      const startDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
      const lastDay = new Date(currentYear, currentMonth, 0).getDate();
      const endDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${lastDay}`;
      
      await createBudget({
        name: `${budgetFormData.category} Budget - ${currentMonth}/${currentYear}`,
        category: budgetFormData.category,
        budgetAmount: budgetFormData.amount,
        amount: budgetFormData.amount, // Keep for backwards compatibility
        period: "Monthly",
        startDate,
        endDate,
        month: currentMonth, // Keep for backwards compatibility
        year: currentYear, // Keep for backwards compatibility
        alertThreshold: budgetFormData.alertThreshold,
        isActive: true,
      });
      setShowBudgetForm(false);
      setBudgetFormData({
        category: TransactionCategory.GROCERIES,
        amount: 0,
        alertThreshold: 80,
      });
    } catch (err) {
      console.error('Failed to create budget:', err);
    }
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate amount
    if (transactionFormData.amount < 0.01) {
      alert('Amount must be at least $0.01');
      return;
    }
    
    try {
      await addTransaction({
        ...transactionFormData,
        amount: transactionFormData.type === TransactionType.EXPENSE 
          ? -Math.abs(transactionFormData.amount) 
          : Math.abs(transactionFormData.amount),
        date: new Date(transactionFormData.date),
        source: 'manual' as any,
        isRecurring: false,
        isManuallyClassified: true,
      });
      setShowTransactionForm(false);
      setTransactionFormData({
        description: '',
        amount: 0,
        category: TransactionCategory.OTHER,
        type: TransactionType.EXPENSE,
        date: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      console.error('Failed to add transaction:', err);
    }
  };

  const spendingByCategory = getSpendingByCategory();
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const netSavings = getNetSavings();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Expense Tracking</h1>
            </div>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalIncome)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpenses)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Net Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netSavings)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mb-8">
          <Button onClick={() => setShowTransactionForm(true)}>
            Add Transaction
          </Button>
          <Button variant="outline" onClick={() => setShowBudgetForm(true)}>
            Create Budget
          </Button>
        </div>

        {/* Budget Form Modal */}
        {showBudgetForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Create Budget</CardTitle>
                <CardDescription>Set a monthly spending limit for a category</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBudgetSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={budgetFormData.category}
                      onChange={(e) => setBudgetFormData(prev => ({ ...prev, category: e.target.value as TransactionCategory }))}
                      className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.values(TransactionCategory).filter(cat => cat !== TransactionCategory.SALARY).map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Monthly Budget Amount</label>
                    <Input
                      type="number"
                      value={budgetFormData.amount}
                      onChange={(e) => setBudgetFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                      placeholder="Enter budget amount"
                      min={0}
                      step={0.01}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Alert Threshold (%)</label>
                    <Input
                      type="number"
                      value={budgetFormData.alertThreshold}
                      onChange={(e) => setBudgetFormData(prev => ({ ...prev, alertThreshold: parseFloat(e.target.value) || 80 }))}
                      placeholder="80"
                      min={1}
                      max={100}
                      required
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowBudgetForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      Create Budget
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Transaction Form Modal */}
        {showTransactionForm && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowTransactionForm(false);
              }
            }}
          >
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
              {/* Close Button */}
              <button
                onClick={() => setShowTransactionForm(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
                type="button"
                aria-label="Close modal"
              >
                ✕
              </button>
              
              <CardHeader className="pr-12">
                <CardTitle>Add Transaction</CardTitle>
                <CardDescription>Record a new income or expense transaction</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTransactionSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <Input
                        value={transactionFormData.description}
                        onChange={(e) => setTransactionFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter transaction description"
                        required
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Amount</label>
                      <Input
                        type="number"
                        value={transactionFormData.amount}
                        onChange={(e) => setTransactionFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                        placeholder="Enter amount (min 0.01)"
                        min={0.01}
                        step={0.01}
                        required
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Type</label>
                      <select
                        value={transactionFormData.type}
                        onChange={(e) => setTransactionFormData(prev => ({ ...prev, type: e.target.value as TransactionType }))}
                        className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={TransactionType.INCOME}>Income</option>
                        <option value={TransactionType.EXPENSE}>Expense</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Category</label>
                      <select
                        value={transactionFormData.category}
                        onChange={(e) => setTransactionFormData(prev => ({ ...prev, category: e.target.value as TransactionCategory }))}
                        className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {Object.values(TransactionCategory).map(category => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Date</label>
                    <Input
                      type="date"
                      value={transactionFormData.date}
                      onChange={(e) => setTransactionFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                      className="h-10"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowTransactionForm(false)}
                      className="flex-1 order-2 sm:order-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 order-1 sm:order-2" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Adding...' : 'Add Transaction'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Budgets and Transactions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Budgets Section */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Budgets</CardTitle>
              <CardDescription>Track your spending against budgets</CardDescription>
            </CardHeader>
            <CardContent>
              {budgets.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📊</div>
                  <p className="text-gray-500 mb-4">No budgets created yet</p>
                  <Button onClick={() => setShowBudgetForm(true)}>
                    Create Your First Budget
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {budgets.map((budget) => {
                    const utilization = (budget.amount && budget.amount > 0) ? (Math.abs(budget.spent || 0) / budget.amount) * 100 : 0;
                    const isNearLimit = utilization >= budget.alertThreshold;
                    const isOverBudget = utilization >= 100;
                    
                    return (
                      <div key={budget.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium capitalize">
                            {budget.category.replace('_', ' ')}
                          </h3>
                          <span className={`text-sm font-medium ${
                            isOverBudget ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {utilization.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Spent: {formatCurrency(Math.abs(budget.spent))}</span>
                          <span>Budget: {formatCurrency(budget.amount || 0)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              isOverBudget ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(utilization, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activity</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">💳</div>
                  <p className="text-gray-500 mb-4">No transactions yet</p>
                  <Button onClick={() => setShowTransactionForm(true)}>
                    Add Your First Transaction
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transactions.slice(0, 10).map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-500 capitalize">
                          {transaction.category.replace('_', ' ')} • {transaction.date.toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`font-medium ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Spending by Category */}
        {spendingByCategory.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>Breakdown of your expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {spendingByCategory.map((item) => (
                  <div key={item.category} className="flex justify-between items-center">
                    <div className="flex items-center flex-1">
                      <span className="font-medium capitalize w-32">
                        {item.category.replace('_', ' ')}
                      </span>
                      <div className="flex-1 mx-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(item.amount)}</div>
                      <div className="text-sm text-gray-500">{item.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ExpenseTracking;
