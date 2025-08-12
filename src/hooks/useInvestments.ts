import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { investmentService } from '../services/investment.service';
import {
  InvestmentSuggestion,
  SavingsProjection,
  InvestmentRecommendationParams
} from '../types/investment.types';

export const useInvestments = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<InvestmentSuggestion[]>([]);
  const [savingsProjection, setSavingsProjection] = useState<SavingsProjection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch investment suggestions
  const fetchSuggestions = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const suggestionList = await investmentService.mockGetInvestmentSuggestions();
      setSuggestions(suggestionList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch investment suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate investment suggestions
  const generateSuggestions = async (params: InvestmentRecommendationParams): Promise<InvestmentSuggestion[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newSuggestions = await investmentService.mockGenerateInvestmentSuggestions(params);
      
      // Store suggestions for persistence
      localStorage.setItem('mock_investment_suggestions', JSON.stringify(newSuggestions));
      setSuggestions(newSuggestions);
      
      return newSuggestions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate suggestions';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Accept suggestion
  const acceptSuggestion = async (suggestionId: string): Promise<void> => {
    try {
      setError(null);
      await investmentService.mockAcceptSuggestion(suggestionId);
      
      // Update local state
      setSuggestions(prev => 
        prev.map(suggestion => 
          suggestion.id === suggestionId 
            ? { ...suggestion, status: 'accepted' as any, updatedAt: new Date() }
            : suggestion
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept suggestion';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Reject suggestion
  const rejectSuggestion = async (suggestionId: string): Promise<void> => {
    try {
      setError(null);
      await investmentService.mockRejectSuggestion(suggestionId);
      
      // Update local state
      setSuggestions(prev => 
        prev.map(suggestion => 
          suggestion.id === suggestionId 
            ? { ...suggestion, status: 'rejected' as any, updatedAt: new Date() }
            : suggestion
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject suggestion';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Calculate savings projection
  const calculateSavingsProjection = async (
    currentIncome: number, 
    currentExpenses: number, 
    savingsThreshold: number
  ): Promise<SavingsProjection> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const projection = await investmentService.mockCalculateSavingsProjection(
        currentIncome, 
        currentExpenses, 
        savingsThreshold
      );
      
      setSavingsProjection(projection);
      return projection;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate savings projection';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Get pending suggestions
  const getPendingSuggestions = (): InvestmentSuggestion[] => {
    return suggestions.filter(s => s.status === 'pending');
  };

  // Get accepted suggestions
  const getAcceptedSuggestions = (): InvestmentSuggestion[] => {
    return suggestions.filter(s => s.status === 'accepted');
  };

  // Get total suggested amount
  const getTotalSuggestedAmount = (): number => {
    return getPendingSuggestions().reduce((total, suggestion) => total + suggestion.suggestedAmount, 0);
  };

  // Get average expected return
  const getAverageExpectedReturn = (): number => {
    const pendingSuggestions = getPendingSuggestions();
    if (pendingSuggestions.length === 0) return 0;
    
    const totalReturn = pendingSuggestions.reduce((sum, suggestion) => sum + suggestion.expectedReturn, 0);
    return totalReturn / pendingSuggestions.length;
  };

  // Initialize data on mount
  useEffect(() => {
    fetchSuggestions();
  }, [user]);

  return {
    suggestions,
    savingsProjection,
    isLoading,
    error,
    generateSuggestions,
    acceptSuggestion,
    rejectSuggestion,
    calculateSavingsProjection,
    fetchSuggestions,
    getPendingSuggestions,
    getAcceptedSuggestions,
    getTotalSuggestedAmount,
    getAverageExpectedReturn,
  };
};
