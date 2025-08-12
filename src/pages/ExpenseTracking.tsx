import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useExpenses } from "../hooks/useExpenses";
import { useBankAccounts } from "../hooks/useBankAccounts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { TransactionCategory, TransactionType } from "../types/expense.types";
import AppLayout from "../components/layout/AppLayout";

const ExpenseTracking: React.FC = () => {
  const {} = useAuth();
  const { hasLinkedAccounts, activeAccounts } = useBankAccounts();
  const {
    transactions,
    budgets,
    getTotalIncome,
    getTotalExpenses,
    getNetSavings,
    getSpendingByCategory,
    createBudget,
    addTransaction,
    isLoading,
  } = useExpenses();

  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [budgetFormData, setBudgetFormData] = useState({
    category: TransactionCategory.GROCERIES,
    amount: 0,
    alertThreshold: 80,
  });
  const [transactionFormData, setTransactionFormData] = useState({
    description: "",
    amount: 0,
    category: TransactionCategory.OTHER,
    type: TransactionType.EXPENSE,
    date: new Date().toISOString().split("T")[0],
    linkedAccountId: "",
  });

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const startDate = `${currentYear}-${currentMonth
        .toString()
        .padStart(2, "0")}-01`;
      const lastDay = new Date(currentYear, currentMonth, 0).getDate();
      const endDate = `${currentYear}-${currentMonth
        .toString()
        .padStart(2, "0")}-${lastDay}`;

      await createBudget({
        name: `${budgetFormData.category} Budget - ${currentMonth}/${currentYear}`,
        category: budgetFormData.category,
        budgetAmount: budgetFormData.amount,
        amount: budgetFormData.amount,
        period: "Monthly",
        startDate,
        endDate,
        month: currentMonth,
        year: currentYear,
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
      }
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (transactionFormData.amount < 0.01) {
      alert("Amount must be at least ₹0.01");
      return;
    }

    if (!transactionFormData.linkedAccountId) {
      alert("Please select a bank account");
      return;
    }

    try {
      await addTransaction({
        ...transactionFormData,
        amount:
          transactionFormData.type === TransactionType.EXPENSE
            ? -Math.abs(transactionFormData.amount)
            : Math.abs(transactionFormData.amount),
        date: new Date(transactionFormData.date),
        source: "manual" as any,
        isRecurring: false,
        isManuallyClassified: true,
        bankAccountId: transactionFormData.linkedAccountId,
      });
      setShowTransactionForm(false);
      setTransactionFormData({
        description: "",
        amount: 0,
        category: TransactionCategory.OTHER,
        type: TransactionType.EXPENSE,
        date: new Date().toISOString().split("T")[0],
        linkedAccountId: "",
      });
    } catch (err) {
      }
  };

  const spendingByCategory = getSpendingByCategory();
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const netSavings = getNetSavings();

  return (
    <AppLayout title="Expense Tracking">
      <div className="space-y-8">
        {/* Account Requirement Check */}
        {!hasLinkedAccounts && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <div className="text-amber-600 mt-0.5">⚠️</div>
                <div>
                  <h3 className="font-medium text-amber-800 mb-2">
                    Bank Account Required
                  </h3>
                  <p className="text-sm text-amber-700 mb-4">
                    You need to link at least one bank account before you can
                    add expenses or create budgets. Please go to the{" "}
                    <a
                      href="/salary"
                      className="font-medium underline hover:no-underline"
                    >
                      Income Management
                    </a>{" "}
                    page to link your accounts first.
                  </p>
                  <Button
                    onClick={() => (window.location.href = "/salary")}
                    variant="secondary"
                    className="bg-amber-100 text-amber-800 hover:bg-amber-200"
                  >
                    Go to Income Management
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="glass" className="animate-scale-in">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Total Income
              </h3>
              <p className="text-2xl font-bold text-success-600">
                {formatCurrency(totalIncome)}
              </p>
            </CardContent>
          </Card>

          <Card
            variant="glass"
            className="animate-scale-in"
            style={{ animationDelay: "0.1s" }}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-danger-500 to-danger-600 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Total Expenses
              </h3>
              <p className="text-2xl font-bold text-danger-600">
                {formatCurrency(Math.abs(totalExpenses))}
              </p>
            </CardContent>
          </Card>

          <Card
            variant="glass"
            className="animate-scale-in"
            style={{ animationDelay: "0.2s" }}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Net Savings
              </h3>
              <p
                className={`text-2xl font-bold ${
                  netSavings >= 0 ? "text-success-600" : "text-danger-600"
                }`}
              >
                {formatCurrency(netSavings)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="primary"
            onClick={() => setShowBudgetForm(true)}
            className="flex-1"
            disabled={!hasLinkedAccounts}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            }
          >
            Create Budget
          </Button>
          <Button
            variant="success"
            onClick={() => setShowTransactionForm(true)}
            className="flex-1"
            disabled={!hasLinkedAccounts}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            }
          >
            Add Transaction
          </Button>
        </div>

        {/* Budget Form Modal */}
        {showBudgetForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <Card
              variant="glass"
              className="w-full max-w-md mx-4 animate-scale-in"
            >
              <CardHeader className="bg-gradient-to-r from-white via-brand-50/30 to-success-50/30 border-b border-white/20">
                <CardTitle className="text-gradient flex items-center">
                  <svg
                    className="w-6 h-6 mr-3 text-brand-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Create Budget
                </CardTitle>
                <CardDescription>
                  Set spending limits for different categories
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleBudgetSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">
                      Category
                    </label>
                    <Select
                      value={budgetFormData.category}
                      onChange={(e) =>
                        setBudgetFormData((prev) => ({
                          ...prev,
                          category: e.target.value as TransactionCategory,
                        }))
                      }
                      required
                    >
                      {Object.values(TransactionCategory).map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() +
                            category.slice(1).replace("_", " ")}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <Input
                    type="number"
                    label="Budget Amount"
                    value={budgetFormData.amount}
                    onChange={(e) =>
                      setBudgetFormData((prev) => ({
                        ...prev,
                        amount: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="Enter budget amount"
                    min={0}
                    step={0.01}
                    required
                    icon={
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    }
                  />

                  <Input
                    type="number"
                    label="Alert Threshold (%)"
                    value={budgetFormData.alertThreshold}
                    onChange={(e) =>
                      setBudgetFormData((prev) => ({
                        ...prev,
                        alertThreshold: parseInt(e.target.value) || 80,
                      }))
                    }
                    placeholder="Alert when reaching this percentage"
                    min={1}
                    max={100}
                    required
                  />

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowBudgetForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex-1"
                      disabled={isLoading}
                      isLoading={isLoading}
                    >
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <Card
              variant="glass"
              className="w-full max-w-md mx-4 animate-scale-in"
            >
              <CardHeader className="bg-gradient-to-r from-white via-brand-50/30 to-success-50/30 border-b border-white/20">
                <CardTitle className="text-gradient flex items-center">
                  <svg
                    className="w-6 h-6 mr-3 text-brand-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Transaction
                </CardTitle>
                <CardDescription>
                  Record a new income or expense transaction
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleTransactionSubmit} className="space-y-6">
                  <Input
                    label="Description"
                    value={transactionFormData.description}
                    onChange={(e) =>
                      setTransactionFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Enter transaction description"
                    required
                    icon={
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    }
                  />

                  <Input
                    type="number"
                    label="Amount"
                    value={transactionFormData.amount}
                    onChange={(e) =>
                      setTransactionFormData((prev) => ({
                        ...prev,
                        amount: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="Enter amount"
                    min={0}
                    step={0.01}
                    required
                    icon={
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    }
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">
                      Bank Account *
                    </label>
                    <Select
                      value={transactionFormData.linkedAccountId}
                      onChange={(e) =>
                        setTransactionFormData((prev) => ({
                          ...prev,
                          linkedAccountId: e.target.value,
                        }))
                      }
                      required
                    >
                      <option value="">Select an account</option>
                      {activeAccounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.accountName} - {account.bankName} (
                          {account.currencyCode}{" "}
                          {account.balance.toLocaleString()})
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">
                      Type
                    </label>
                    <Select
                      value={transactionFormData.type}
                      onChange={(e) =>
                        setTransactionFormData((prev) => ({
                          ...prev,
                          type: e.target.value as TransactionType,
                        }))
                      }
                      required
                    >
                      <option value={TransactionType.INCOME}>Income</option>
                      <option value={TransactionType.EXPENSE}>Expense</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">
                      Category
                    </label>
                    <Select
                      value={transactionFormData.category}
                      onChange={(e) =>
                        setTransactionFormData((prev) => ({
                          ...prev,
                          category: e.target.value as TransactionCategory,
                        }))
                      }
                      required
                    >
                      {Object.values(TransactionCategory).map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() +
                            category.slice(1).replace("_", " ")}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <Input
                    type="date"
                    label="Date"
                    value={transactionFormData.date}
                    onChange={(e) =>
                      setTransactionFormData((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                    required
                    icon={
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    }
                  />

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowTransactionForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex-1"
                      disabled={isLoading}
                      isLoading={isLoading}
                    >
                      Add Transaction
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
          <Card variant="elevated" className="animate-slide-up">
            <CardHeader className="bg-gradient-to-r from-white to-brand-50/30">
              <CardTitle className="text-2xl text-gradient flex items-center">
                <svg
                  className="w-6 h-6 mr-3 text-brand-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                Budgets
              </CardTitle>
              <CardDescription>Track your spending limits</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {budgets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    No Budgets Yet
                  </h3>
                  <p className="text-neutral-600 mb-6">
                    Create your first budget to start tracking expenses
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setShowBudgetForm(true)}
                  >
                    Create Budget
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {budgets.map((budget) => {
                    const utilization =
                      budget.amount && budget.amount > 0
                        ? (Math.abs(budget.spent) / budget.amount) * 100
                        : 0;
                    const isNearLimit = utilization >= budget.alertThreshold;
                    const isOverBudget = utilization >= 100;

                    return (
                      <div
                        key={budget.id}
                        className="border border-neutral-200 rounded-xl p-6 bg-gradient-to-br from-white to-neutral-50/50 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold text-lg text-neutral-900 capitalize flex items-center">
                            <div
                              className={`w-3 h-3 rounded-full mr-3 ${
                                isOverBudget
                                  ? "bg-danger-500"
                                  : isNearLimit
                                  ? "bg-warning-500"
                                  : "bg-success-500"
                              }`}
                            ></div>
                            {budget.category.replace("_", " ")}
                          </h3>
                          <span
                            className={`text-sm font-bold px-3 py-1 rounded-full ${
                              isOverBudget
                                ? "text-danger-700 bg-danger-100"
                                : isNearLimit
                                ? "text-warning-700 bg-warning-100"
                                : "text-success-700 bg-success-100"
                            }`}
                          >
                            {utilization.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-neutral-600 mb-3">
                          <span className="font-medium">
                            Spent:{" "}
                            <span className="text-neutral-900">
                              {formatCurrency(Math.abs(budget.spent))}
                            </span>
                          </span>
                          <span className="font-medium">
                            Budget:{" "}
                            <span className="text-neutral-900">
                              {formatCurrency(budget.amount || 0)}
                            </span>
                          </span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 ease-out ${
                              isOverBudget
                                ? "bg-gradient-to-r from-danger-500 to-danger-600"
                                : isNearLimit
                                ? "bg-gradient-to-r from-warning-500 to-warning-600"
                                : "bg-gradient-to-r from-success-500 to-success-600"
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
          <Card
            variant="elevated"
            className="animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <CardHeader className="bg-gradient-to-r from-white to-success-50/30">
              <CardTitle className="text-2xl text-gradient flex items-center">
                <svg
                  className="w-6 h-6 mr-3 text-success-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2M9 5a2 2 0 012 2v6a2 2 0 01-2 2M9 5a2 2 0 012 2v6a2 2 0 01-2 2m6-6V9a2 2 0 012-2h2a2 2 0 012 2v2M7 19a2 2 0 002-2v-2M15 19a2 2 0 01-2-2v-2"
                  />
                </svg>
                Recent Transactions
              </CardTitle>
              <CardDescription>Your latest financial activity</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2M9 5a2 2 0 012 2v6a2 2 0 01-2 2M9 5a2 2 0 012 2v6a2 2 0 01-2 2m6-6V9a2 2 0 012-2h2a2 2 0 012 2v2M7 19a2 2 0 002-2v-2M15 19a2 2 0 01-2-2v-2"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    No Transactions Yet
                  </h3>
                  <p className="text-neutral-600 mb-6">
                    Add your first transaction to start tracking
                  </p>
                  <Button
                    variant="success"
                    onClick={() => setShowTransactionForm(true)}
                  >
                    Add Transaction
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                  {transactions.slice(0, 10).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg bg-gradient-to-r from-white to-neutral-50/50 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.amount >= 0
                              ? "bg-success-100 text-success-600"
                              : "bg-danger-100 text-danger-600"
                          }`}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d={
                                transaction.amount >= 0
                                  ? "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                  : "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                              }
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-neutral-500 capitalize">
                            {transaction.category.replace("_", " ")} •{" "}
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            transaction.amount >= 0
                              ? "text-success-600"
                              : "text-danger-600"
                          }`}
                        >
                          {transaction.amount >= 0 ? "+" : ""}
                          {formatCurrency(transaction.amount)}
                        </p>
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
          <Card variant="gradient" className="animate-slide-up">
            <CardHeader>
              <CardTitle className="text-2xl text-gradient">
                Spending by Category
              </CardTitle>
              <CardDescription>Where your money goes</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {spendingByCategory.map((item) => (
                  <div
                    key={item.category}
                    className="p-4 border border-neutral-200 rounded-lg bg-white/50"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium capitalize text-neutral-900">
                        {item.category.replace("_", " ")}
                      </span>
                      <span className="font-semibold text-neutral-700">
                        {formatCurrency(Math.abs(item.amount))}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-brand-500 to-brand-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            (Math.abs(item.amount) / Math.abs(totalExpenses)) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default ExpenseTracking;

