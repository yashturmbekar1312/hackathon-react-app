import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useInvestments } from '@/hooks/useInvestments';
import { useSalary } from '@/hooks/useSalary';
import { useExpenses } from '@/hooks/useExpenses';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InvestmentRecommendationParams, TimeHorizon } from '@/types/investment.types';

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
    isLoading
  } = useInvestments();
  const { getMonthlyIncome } = useSalary();
  const { getTotalExpenses } = useExpenses();

  const [hasGeneratedSuggestions, setHasGeneratedSuggestions] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      const monthlyIncome = getMonthlyIncome();
      const totalExpenses = getTotalExpenses();

      if (monthlyIncome > 0 && user?.savingsThreshold) {
        await calculateSavingsProjection(monthlyIncome, totalExpenses, user.savingsThreshold);
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
      console.error('Failed to generate suggestions:', error);
    }
  };

  const handleAcceptSuggestion = async (suggestionId: string) => {
    try {
      await acceptSuggestion(suggestionId);
    } catch (error) {
      console.error('Failed to accept suggestion:', error);
    }
  };

  const handleRejectSuggestion = async (suggestionId: string) => {
    try {
      await rejectSuggestion(suggestionId);
    } catch (error) {
      console.error('Failed to reject suggestion:', error);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
    }).format(amount);
  };

  const getRiskColor = (riskLevel: string): string => {
    switch (riskLevel.toLowerCase()) {
      case 'low':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'high':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const pendingSuggestions = getPendingSuggestions();
  const acceptedSuggestions = getAcceptedSuggestions();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Investment Suggestions</h1>
            </div>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Savings Projection Summary */}
        {savingsProjection && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Investment Opportunity</CardTitle>
              <CardDescription>
                Based on your current financial situation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(savingsProjection.currentSavings)}
                  </div>
                  <p className="text-sm text-gray-600">Current Savings</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(savingsProjection.projectedMonthEndSavings)}
                  </div>
                  <p className="text-sm text-gray-600">Projected Month-End</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(savingsProjection.surplusAmount)}
                  </div>
                  <p className="text-sm text-gray-600">Available for Investment</p>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${savingsProjection.isAboveThreshold ? 'text-green-600' : 'text-red-600'}`}>
                    {savingsProjection.isAboveThreshold ? '✓' : '✗'}
                  </div>
                  <p className="text-sm text-gray-600">Above Threshold</p>
                </div>
              </div>

              {savingsProjection.surplusAmount > 0 && !hasGeneratedSuggestions && (
                <div className="mt-6 text-center">
                  <Button onClick={handleGenerateSuggestions} disabled={isLoading}>
                    {isLoading ? 'Generating Suggestions...' : 'Generate AI Investment Suggestions'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* No Surplus Message */}
        {savingsProjection && savingsProjection.surplusAmount <= 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">💡</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Focus on Building Your Emergency Fund
              </h3>
              <p className="text-gray-600 mb-6">
                Based on your current financial situation, we recommend focusing on building your emergency fund
                before considering investments. Try to reduce expenses or increase income to create a surplus.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-blue-700">
                  <strong>Tip:</strong> Aim to save at least {formatCurrency(user?.savingsThreshold || 1000)} per month
                  before investing. This ensures you have a safety net for unexpected expenses.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Suggestions */}
        {pendingSuggestions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Investment Suggestions</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingSuggestions.map((suggestion) => (
                <Card key={suggestion.id} className="relative">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {suggestion.type.replace('_', ' ').toUpperCase()}
                        </CardDescription>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(suggestion.riskLevel)}`}>
                        {suggestion.riskLevel.toUpperCase()} RISK
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{suggestion.description}</p>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Suggested Amount:</span>
                        <span className="font-medium">{formatCurrency(suggestion.suggestedAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expected Return:</span>
                        <span className="font-medium text-green-600">{suggestion.expectedReturn}% annually</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time Horizon:</span>
                        <span className="font-medium capitalize">
                          {suggestion.timeHorizon.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Why this suggestion?</h4>
                      <p className="text-sm text-gray-600">{suggestion.reasoning}</p>
                    </div>

                    <div className="flex space-x-3">
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
                        className="flex-1"
                        disabled={isLoading}
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
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Investment Plan</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {acceptedSuggestions.map((suggestion) => (
                <Card key={suggestion.id} className="border-green-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {suggestion.type.replace('_', ' ').toUpperCase()}
                        </CardDescription>
                      </div>
                      <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
                        ACCEPTED
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Investment Amount:</span>
                        <span className="font-medium">{formatCurrency(suggestion.suggestedAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expected Return:</span>
                        <span className="font-medium text-green-600">{suggestion.expectedReturn}% annually</span>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-700">
                        <strong>Next Steps:</strong> Contact a financial advisor or investment platform to execute this investment.
                        Always conduct your own research before investing.
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
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full text-blue-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.83 6.72 2.24" />
                  <path d="M21 3v4h-4" />
                  <path d="M21 3 15 9" />
                  <path d="M12 8v4l3 3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Get Personalized Investment Suggestions
              </h3>
              <p className="text-gray-600 mb-6">
                Set up your income plan and track your expenses to receive AI-powered investment recommendations
                tailored to your financial situation and risk profile.
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={() => navigate('/salary')}>
                  Set Income Plan
                </Button>
                <Button onClick={() => navigate('/expenses')}>
                  Track Expenses
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Investment Education */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Investment Basics</CardTitle>
            <CardDescription>
              Learn about different types of investments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-xl bg-gradient-to-b from-blue-50 to-white shadow-md hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 mx-auto mb-4 text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <path d="M8 15h0" />
                    <path d="M12 15h0" />
                    <path d="M16 15h0" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Conservative</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Low-risk investments like bonds, fixed deposits, and high-yield savings accounts.
                </p>
              </div>
              <div className="text-center p-6 rounded-xl bg-gradient-to-b from-purple-50 to-white shadow-md hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 mx-auto mb-4 text-purple-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="20" x2="12" y2="10" />
                    <line x1="18" y1="20" x2="18" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="16" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Balanced</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Mix of stocks, bonds, and mutual funds for moderate risk and return.
                </p>
              </div>
              <div className="text-center p-6 rounded-xl bg-gradient-to-b from-green-50 to-white shadow-md hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 mx-auto mb-4 text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Aggressive</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Higher-risk investments like growth stocks and emerging market funds.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default InvestmentSuggestions;
