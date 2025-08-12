import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useIncomePlans } from "../hooks/useIncomePlans";
import { useExpenses } from "../hooks/useExpenses";
import { useInvestments } from "../hooks/useInvestments";
import { useBankAccounts } from "../hooks/useBankAccounts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StatsCard,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import AppLayout from "../components/layout/AppLayout";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { hasLinkedAccounts } = useBankAccounts();
  const { getMonthlyIncome, getNextPayDate } = useIncomePlans();
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
        await calculateSavingsProjection(
          monthlyIncome,
          totalExpenses,
          user.savingsThreshold
        );
      }
    };

    loadDashboardData();
  }, [user]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return "Not set";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const budgetAlerts = getBudgetAlerts();
  const savingsRate =
    dashboardData.monthlyIncome > 0
      ? (dashboardData.netSavings / dashboardData.monthlyIncome) * 100
      : 0;

  return (
    <AppLayout title="Dashboard">
      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <div className="mb-8 animate-slide-down">
          <Card
            variant="glass"
            className="border-warning-200 bg-gradient-to-r from-warning-50 to-warning-100"
          >
            <CardHeader className="pb-4">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-warning-500 text-white mr-3">
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-warning-800">
                    Budget Alerts
                  </CardTitle>
                  <CardDescription className="text-warning-700">
                    You have {budgetAlerts.length} budget(s) that need attention
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {budgetAlerts.map((budget) => (
                  <div
                    key={budget.id}
                    className="flex items-center justify-between p-3 bg-white/50 rounded-lg"
                  >
                    <span className="font-medium text-warning-800">
                      {budget.category}
                    </span>
                    <span className="text-sm text-warning-700">
                      {budget.amount
                        ? (
                            (Math.abs(budget.spent) / budget.amount) *
                            100
                          ).toFixed(1)
                        : 0}
                      % used
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Monthly Income"
          value={formatCurrency(dashboardData.monthlyIncome)}
          valueColor="success"
          icon={
            <svg
              className="w-6 h-6"
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
          className="animate-fade-in-up"
          style={{ animationDelay: "0ms" }}
        />

        <StatsCard
          title="Total Expenses"
          value={formatCurrency(dashboardData.totalExpenses)}
          valueColor="danger"
          icon={
            <svg
              className="w-6 h-6"
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
          }
          className="animate-fade-in-up"
          style={{ animationDelay: "100ms" }}
        />

        <StatsCard
          title="Net Savings"
          value={formatCurrency(dashboardData.netSavings)}
          valueColor={dashboardData.netSavings >= 0 ? "success" : "danger"}
          trend={{
            value: savingsRate,
            isPositive: dashboardData.netSavings >= 0,
          }}
          icon={
            <svg
              className="w-6 h-6"
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
          }
          className="animate-fade-in-up"
          style={{ animationDelay: "200ms" }}
        />

        <StatsCard
          title="Next Payday"
          value={formatDate(dashboardData.nextPayDate)}
          icon={
            <svg
              className="w-6 h-6"
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
          className="animate-fade-in-up"
          style={{ animationDelay: "300ms" }}
        />
      </div>

      {/* Savings Projection & Quick Actions */}
      {savingsProjection && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card variant="gradient" className="animate-slide-up">
            <CardHeader>
              <CardTitle className="text-gradient">
                Savings Projection
              </CardTitle>
              <CardDescription>
                Based on your current savings rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">6 months</span>
                  <span className="font-semibold">
                    {formatCurrency(
                      savingsProjection.currentSavings +
                        savingsProjection.surplusAmount * 6
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">1 year</span>
                  <span className="font-semibold">
                    {formatCurrency(
                      savingsProjection.currentSavings +
                        savingsProjection.surplusAmount * 12
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">5 years</span>
                  <span className="font-semibold">
                    {formatCurrency(
                      savingsProjection.currentSavings +
                        savingsProjection.surplusAmount * 60
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            variant="gradient"
            className="animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <CardHeader>
              <CardTitle className="text-gradient">Quick Actions</CardTitle>
              <CardDescription>
                Manage your finances efficiently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/salary")}
                  className="flex-col h-auto py-4"
                >
                  <svg
                    className="w-6 h-6 mb-2"
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
                  Manage Income
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate("/expenses")}
                  className="flex-col h-auto py-4"
                  disabled={!hasLinkedAccounts}
                >
                  <svg
                    className="w-6 h-6 mb-2"
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
                  Track Expenses
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => navigate("/investments")}
                  className="flex-col h-auto py-4 col-span-2"
                  disabled={!hasLinkedAccounts}
                >
                  <svg
                    className="w-6 h-6 mb-2"
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
                  Investment Insights
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Get Started Section */}
      {dashboardData.monthlyIncome === 0 && (
        <Card variant="glass" className="animate-fade-in-up">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gradient">
              Welcome to Wealthify!
            </CardTitle>
            <CardDescription>
              Let's get you started on your financial journey
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-brand-500 to-success-500 rounded-2xl flex items-center justify-center">
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="space-y-4">
                <p className="text-neutral-600">
                  Start by setting up your income information to begin tracking
                  your financial progress.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate("/salary")}
                  className="w-full"
                >
                  Set Up Your Income
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
};

export default Dashboard;
