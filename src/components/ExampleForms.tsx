import React, { useState, useEffect } from 'react';
import { useAccountManagement, useTransactionManagement, useBudgetManagement } from '../hooks/useApiIntegration';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

// Example: Account Creation Form
export const CreateAccountForm: React.FC = () => {
  const { createAccount, isCreatingAccount, createAccountError } = useAccountManagement();
  const [formData, setFormData] = useState({
    accountName: '',
    accountType: 'Checking',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    balance: 0,
    currency: 'USD'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newAccount = await createAccount(formData);
      console.log('Account created:', newAccount);
      // Reset form or redirect
      setFormData({
        accountName: '',
        accountType: 'Checking',
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        balance: 0,
        currency: 'USD'
      });
    } catch (error) {
      console.error('Failed to create account:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Account</CardTitle>
        <CardDescription>Add a new financial account to track</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Account Name"
            value={formData.accountName}
            onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
            required
          />
          <select
            value={formData.accountType}
            onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="Checking">Checking</option>
            <option value="Savings">Savings</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Investment">Investment</option>
          </select>
          <Input
            type="text"
            placeholder="Bank Name"
            value={formData.bankName}
            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
            required
          />
          <Input
            type="text"
            placeholder="Account Number"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            required
          />
          <Input
            type="text"
            placeholder="Routing Number"
            value={formData.routingNumber}
            onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
            required
          />
          <Input
            type="number"
            placeholder="Initial Balance"
            value={formData.balance}
            onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
            step="0.01"
          />
          
          {createAccountError && (
            <div className="text-red-600 text-sm">{createAccountError}</div>
          )}
          
          <Button type="submit" disabled={isCreatingAccount} className="w-full">
            {isCreatingAccount ? 'Creating...' : 'Create Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Example: Transaction Creation Form
export const CreateTransactionForm: React.FC = () => {
  const { createTransaction, isCreatingTransaction, createTransactionError } = useTransactionManagement();
  const { getAllAccounts, isGettingAccounts } = useAccountManagement();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    accountId: '',
    amount: 0,
    type: 'Expense' as 'Income' | 'Expense',
    category: 'Food',
    subcategory: '',
    description: '',
    transactionDate: new Date().toISOString().split('T')[0],
    merchant: '',
    location: '',
    tags: [] as string[]
  });

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const accountList = await getAllAccounts();
        setAccounts(accountList || []);
      } catch (error) {
        console.error('Failed to load accounts:', error);
      }
    };
    loadAccounts();
  }, [getAllAccounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newTransaction = await createTransaction({
        ...formData,
        transactionDate: new Date(formData.transactionDate).toISOString()
      });
      console.log('Transaction created:', newTransaction);
      // Reset form
      setFormData({
        accountId: '',
        amount: 0,
        type: 'Expense',
        category: 'Food',
        subcategory: '',
        description: '',
        transactionDate: new Date().toISOString().split('T')[0],
        merchant: '',
        location: '',
        tags: []
      });
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Transaction</CardTitle>
        <CardDescription>Record a new income or expense transaction</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={formData.accountId}
            onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
            className="w-full p-2 border rounded"
            required
            disabled={isGettingAccounts}
          >
            <option value="">Select Account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.accountName} - {account.bankName}
              </option>
            ))}
          </select>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              placeholder="Amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              step="0.01"
              required
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Income' | 'Expense' })}
              className="p-2 border rounded"
            >
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
          </div>
          
          <Input
            type="text"
            placeholder="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          />
          
          <Input
            type="text"
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          
          <Input
            type="date"
            value={formData.transactionDate}
            onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
            required
          />
          
          <Input
            type="text"
            placeholder="Merchant (optional)"
            value={formData.merchant}
            onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
          />
          
          {createTransactionError && (
            <div className="text-red-600 text-sm">{createTransactionError}</div>
          )}
          
          <Button type="submit" disabled={isCreatingTransaction} className="w-full">
            {isCreatingTransaction ? 'Creating...' : 'Add Transaction'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Example: Budget Creation Form
export const CreateBudgetForm: React.FC = () => {
  const { createBudget, isCreatingBudget, createBudgetError } = useBudgetManagement();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Food',
    budgetAmount: 0,
    period: 'Monthly' as 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    alertThreshold: 80,
    isActive: true
  });

  useEffect(() => {
    // Auto-calculate end date based on period
    const startDate = new Date(formData.startDate);
    let endDate = new Date(startDate);
    
    switch (formData.period) {
      case 'Weekly':
        endDate.setDate(startDate.getDate() + 7);
        break;
      case 'Monthly':
        endDate.setMonth(startDate.getMonth() + 1);
        break;
      case 'Quarterly':
        endDate.setMonth(startDate.getMonth() + 3);
        break;
      case 'Yearly':
        endDate.setFullYear(startDate.getFullYear() + 1);
        break;
    }
    
    setFormData(prev => ({ ...prev, endDate: endDate.toISOString().split('T')[0] }));
  }, [formData.startDate, formData.period]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newBudget = await createBudget(formData);
      console.log('Budget created:', newBudget);
      // Reset form
      setFormData({
        name: '',
        category: 'Food',
        budgetAmount: 0,
        period: 'Monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        alertThreshold: 80,
        isActive: true
      });
    } catch (error) {
      console.error('Failed to create budget:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Budget</CardTitle>
        <CardDescription>Set spending limits for different categories</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Budget Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          
          <Input
            type="text"
            placeholder="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          />
          
          <Input
            type="number"
            placeholder="Budget Amount"
            value={formData.budgetAmount}
            onChange={(e) => setFormData({ ...formData, budgetAmount: parseFloat(e.target.value) || 0 })}
            step="0.01"
            required
          />
          
          <select
            value={formData.period}
            onChange={(e) => setFormData({ ...formData, period: e.target.value as any })}
            className="w-full p-2 border rounded"
          >
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Yearly">Yearly</option>
          </select>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              type="date"
              value={formData.endDate}
              readOnly
              className="bg-gray-100"
            />
          </div>
          
          <Input
            type="number"
            placeholder="Alert Threshold (%)"
            value={formData.alertThreshold}
            onChange={(e) => setFormData({ ...formData, alertThreshold: parseInt(e.target.value) || 80 })}
            min="0"
            max="100"
          />
          
          {createBudgetError && (
            <div className="text-red-600 text-sm">{createBudgetError}</div>
          )}
          
          <Button type="submit" disabled={isCreatingBudget} className="w-full">
            {isCreatingBudget ? 'Creating...' : 'Create Budget'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
