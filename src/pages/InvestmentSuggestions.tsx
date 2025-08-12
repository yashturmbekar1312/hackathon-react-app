import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useInvestments } from "../hooks/useInvestments";
import { useSalary } from "../hooks/useSalary";
import { useExpenses } from "../hooks/useExpenses";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  InvestmentRecommendationParams,
  TimeHorizon,
} from "../types/investment.types";
import AppLayout from "../components/layout/AppLayout";

const InvestmentSuggestions: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    generateSuggestions,
    acceptSuggestion,
    rejectSuggestion,
    savingsProjection,
    calculateSavingsProjection,
    getPendingSuggestions,
    getAcceptedSuggestions,
    isLoading,
  } = useInvestments();
  const { getMonthlyIncome } = useSalary();
  const { getTotalExpenses } = useExpenses();

  const [hasGeneratedSuggestions, setHasGeneratedSuggestions] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      const monthlyIncome = getMonthlyIncome();
      const totalExpenses = getTotalExpenses();

      if (monthlyIncome > 0 && user?.savingsThreshold) {
        await calculateSavingsProjection(
          monthlyIncome,
          totalExpenses,
          user.savingsThreshold
        );
      }
    };

    initializeData();
  }, [user]);

  const handleGenerateSuggestions = async () => {
    if (!user || !savingsProjection) return;

    const params: InvestmentRecommendationParams = {
      surplusAmount: savingsProjection.surplusAmount,
      riskProfile: user.riskProfile,
      age: 30, // Mock age
      monthlyIncome: getMonthlyIncome(),
      existingInvestments: 0, // Mock existing investments
      timeHorizon: TimeHorizon.LONG_TERM,
    };

    try {
      await generateSuggestions(params);
      setHasGeneratedSuggestions(true);
    } catch (error) {
      console.error("Failed to generate suggestions:", error);
    }
  };

  const handleAcceptSuggestion = async (suggestionId: string) => {
    try {
      await acceptSuggestion(suggestionId);
    } catch (error) {
      console.error("Failed to accept suggestion:", error);
    }
  };

  const handleRejectSuggestion = async (suggestionId: string) => {
    try {
      await rejectSuggestion(suggestionId);
    } catch (error) {
      console.error("Failed to reject suggestion:", error);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: user?.currency || "USD",
    }).format(amount);
  };

  const getRiskColor = (riskLevel: string): string => {
    switch (riskLevel.toLowerCase()) {
      case "low":
        return "text-green-600 bg-green-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "high":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const pendingSuggestions = getPendingSuggestions();
  const acceptedSuggestions = getAcceptedSuggestions();

  return (
    <AppLayout title="Investment Suggestions">
      <div className="space-y-8">
        {/* Savings Projection Summary */}
        {savingsProjection && (
          <Card variant="elevated" className="animate-fade-in">
            <CardHeader className="bg-gradient-to-r from-white to-brand-50/30">
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Investment Opportunity
              </CardTitle>
              <CardDescription>
                Based on your current financial situation
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-brand-50 to-brand-100 rounded-xl">
                  <div className="text-2xl font-bold text-brand-700 mb-2">
                    {formatCurrency(savingsProjection.currentSavings)}
                  </div>
                  <p className="text-sm text-brand-600 font-medium">
                    Current Savings
                  </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-success-50 to-success-100 rounded-xl">
                  <div className="text-2xl font-bold text-success-700 mb-2">
                    {formatCurrency(savingsProjection.projectedMonthEndSavings)}
                  </div>
                  <p className="text-sm text-success-600 font-medium">
                    Projected Month-End
                  </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-warning-50 to-warning-100 rounded-xl">
                  <div className="text-2xl font-bold text-warning-700 mb-2">
                    {formatCurrency(savingsProjection.surplusAmount)}
                  </div>
                  <p className="text-sm text-warning-600 font-medium">
                    Available for Investment
                  </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl">
                  <div
                    className={`text-3xl font-bold mb-2 ${
                      savingsProjection.isAboveThreshold
                        ? "text-success-600"
                        : "text-danger-600"
                    }`}
                  >
                    {savingsProjection.isAboveThreshold ? "✓" : "✗"}
                  </div>
                  <p className="text-sm text-neutral-600 font-medium">
                    Above Threshold
                  </p>
                </div>
              </div>

              {savingsProjection.surplusAmount > 0 &&
                !hasGeneratedSuggestions && (
                  <div className="mt-8 text-center">
                    <Button
                      onClick={handleGenerateSuggestions}
                      disabled={isLoading}
                      isLoading={isLoading}
                      variant="primary"
                      size="lg"
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
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                      }
                    >
                      Generate AI Investment Suggestions
                    </Button>
                  </div>
                )}
            </CardContent>
          </Card>
        )}

        {/* No Surplus Message */}
        {savingsProjection && savingsProjection.surplusAmount <= 0 && (
          <Card variant="glass" className="animate-scale-in">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-warning-400 to-warning-500 rounded-2xl flex items-center justify-center text-4xl animate-bounce-gentle">
                💡
              </div>
              <h3 className="text-2xl font-bold text-gradient mb-4">
                Focus on Building Your Emergency Fund
              </h3>
              <p className="text-neutral-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Based on your current financial situation, we recommend focusing
                on building your emergency fund before considering investments.
                Try to reduce expenses or increase income to create a surplus.
              </p>
              <div className="bg-gradient-to-r from-brand-50 to-success-50 border border-brand-200 rounded-xl p-6 max-w-md mx-auto">
                <div className="flex items-center mb-3">
                  <svg
                    className="w-5 h-5 text-brand-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-semibold text-brand-700">Pro Tip</span>
                </div>
                <p className="text-sm text-brand-700">
                  Aim to save at least{" "}
                  {formatCurrency(user?.savingsThreshold || 1000)} per month
                  before investing. This ensures you have a safety net for
                  unexpected expenses.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Suggestions */}
        {pendingSuggestions.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gradient flex items-center animate-slide-down">
              <svg
                className="w-7 h-7 mr-3 text-brand-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              AI-Powered Investment Suggestions
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {pendingSuggestions.map((suggestion, index) => (
                <Card
                  key={suggestion.id}
                  variant="glass"
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="bg-gradient-to-r from-white via-brand-50/30 to-success-50/30 border-b border-white/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl text-gradient">
                          {suggestion.title}
                        </CardTitle>
                        <CardDescription className="mt-2 font-medium">
                          {suggestion.type.replace("_", " ").toUpperCase()}
                        </CardDescription>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-bold ${getRiskColor(
                          suggestion.riskLevel
                        )}`}
                      >
                        {suggestion.riskLevel.toUpperCase()} RISK
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <p className="text-neutral-600 mb-6 leading-relaxed">
                      {suggestion.description}
                    </p>

                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                        <span className="text-neutral-600 font-medium">
                          Suggested Amount:
                        </span>
                        <span className="font-bold text-brand-700">
                          {formatCurrency(suggestion.suggestedAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-success-50 rounded-lg">
                        <span className="text-neutral-600 font-medium">
                          Expected Return:
                        </span>
                        <span className="font-bold text-success-700">
                          {suggestion.expectedReturn}% annually
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                        <span className="text-neutral-600 font-medium">
                          Time Horizon:
                        </span>
                        <span className="font-bold text-neutral-900 capitalize">
                          {suggestion.timeHorizon.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-brand-50 to-success-50 border border-brand-200 rounded-xl p-6 mb-6">
                      <h4 className="font-semibold text-brand-900 mb-3 flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-brand-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Why this suggestion?
                      </h4>
                      <p className="text-sm text-brand-700 leading-relaxed">
                        {suggestion.reasoning}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        variant="outline"
                        onClick={() => handleRejectSuggestion(suggestion.id)}
                        className="flex-1"
                        disabled={isLoading}
                      >
                        Not Interested
                      </Button>
                      <Button
                        onClick={() => handleAcceptSuggestion(suggestion.id)}
                        variant="primary"
                        className="flex-1"
                        disabled={isLoading}
                        isLoading={isLoading}
                        icon={
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        }
                      >
                        Accept & Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Accepted Suggestions */}
        {acceptedSuggestions.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gradient flex items-center animate-slide-down">
              <svg
                className="w-7 h-7 mr-3 text-success-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Your Investment Plan
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {acceptedSuggestions.map((suggestion, index) => (
                <Card
                  key={suggestion.id}
                  variant="elevated"
                  className="border-success-200 animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="bg-gradient-to-r from-white to-success-50/30">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl text-gradient">
                          {suggestion.title}
                        </CardTitle>
                        <CardDescription className="mt-2 font-medium">
                          {suggestion.type.replace("_", " ").toUpperCase()}
                        </CardDescription>
                      </div>
                      <div className="px-3 py-1 rounded-full text-xs font-bold bg-success-100 text-success-700">
                        ACCEPTED
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center p-3 bg-success-50 rounded-lg">
                        <span className="text-neutral-600 font-medium">
                          Investment Amount:
                        </span>
                        <span className="font-bold text-success-700">
                          {formatCurrency(suggestion.suggestedAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                        <span className="text-neutral-600 font-medium">
                          Expected Return:
                        </span>
                        <span className="font-bold text-success-700">
                          {suggestion.expectedReturn}% annually
                        </span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-success-50 to-success-100 border border-success-200 rounded-xl p-6">
                      <div className="flex items-center mb-3">
                        <svg
                          className="w-5 h-5 text-success-600 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="font-semibold text-success-700">
                          Next Steps
                        </span>
                      </div>
                      <p className="text-sm text-success-700 leading-relaxed">
                        Contact a financial advisor or investment platform to
                        execute this investment. Always conduct your own
                        research before investing.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Suggestions State */}
        {!savingsProjection && (
          <Card variant="glass" className="animate-fade-in">
            <CardContent className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center animate-bounce-gentle">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.83 6.72 2.24"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 3v4h-4"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 3 15 9"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gradient mb-4">
                Get Personalized Investment Suggestions
              </h3>
              <p className="text-neutral-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Set up your income plan and track your expenses to receive
                AI-powered investment recommendations tailored to your financial
                situation and risk profile.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/salary")}
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
                >
                  Set Income Plan
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate("/expenses")}
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  }
                >
                  Track Expenses
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Investment Education */}
        <Card variant="gradient" className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <svg
                className="w-6 h-6 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Investment Basics
            </CardTitle>
            <CardDescription className="text-white/80">
              Learn about different types of investments
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 group animate-fade-in">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-success-400 to-success-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">
                  Conservative
                </h3>
                <p className="text-white/80 leading-relaxed">
                  Low-risk investments like bonds, fixed deposits, and
                  high-yield savings accounts.
                </p>
              </div>
              <div
                className="text-center p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 group animate-fade-in"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-warning-400 to-warning-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">Balanced</h3>
                <p className="text-white/80 leading-relaxed">
                  Mix of stocks, bonds, and mutual funds for moderate risk and
                  return.
                </p>
              </div>
              <div
                className="text-center p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 group animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-danger-400 to-danger-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">
                  Aggressive
                </h3>
                <p className="text-white/80 leading-relaxed">
                  Higher-risk investments like growth stocks and emerging market
                  funds.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default InvestmentSuggestions;
