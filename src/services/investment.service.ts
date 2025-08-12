import { apiService } from './api';
import {
  InvestmentSuggestion,
  InvestmentPortfolio,
  Investment,
  SavingsProjection,
  InvestmentRecommendationParams,
  InvestmentType,
  RiskLevel,
  TimeHorizon,
  SuggestionStatus
} from '../types/investment.types';
import { RiskProfile } from '../types/auth.types';

class InvestmentService {
  // Investment Suggestions
  async getInvestmentSuggestions(): Promise<InvestmentSuggestion[]> {
    return await apiService.get<InvestmentSuggestion[]>('/investments/suggestions');
  }

  async generateInvestmentSuggestions(params: InvestmentRecommendationParams): Promise<InvestmentSuggestion[]> {
    return await apiService.post<InvestmentSuggestion[]>('/investments/generate-suggestions', params);
  }

  async acceptSuggestion(suggestionId: string, investmentAmount?: number): Promise<{ message: string }> {
    return await apiService.post<{ message: string }>(`/investments/suggestions/${suggestionId}/accept`, {
      investmentAmount
    });
  }

  async rejectSuggestion(suggestionId: string, reason?: string): Promise<{ message: string }> {
    return await apiService.post<{ message: string }>(`/investments/suggestions/${suggestionId}/reject`, {
      reason
    });
  }

  // Portfolio Management
  async getPortfolio(): Promise<InvestmentPortfolio> {
    return await apiService.get<InvestmentPortfolio>('/investments/portfolio');
  }

  async addInvestment(investmentData: Omit<Investment, 'id' | 'portfolioId' | 'lastUpdated'>): Promise<Investment> {
    return await apiService.post<Investment>('/investments', investmentData);
  }

  async updateInvestment(investmentId: string, investmentData: Partial<Investment>): Promise<Investment> {
    return await apiService.patch<Investment>(`/investments/${investmentId}`, investmentData);
  }

  async removeInvestment(investmentId: string): Promise<void> {
    await apiService.delete(`/investments/${investmentId}`);
  }

  // Savings and Projections
  async calculateSavingsProjection(currentIncome: number, currentExpenses: number, savingsThreshold: number): Promise<SavingsProjection> {
    return await apiService.post<SavingsProjection>('/savings/projection', {
      currentIncome,
      currentExpenses,
      savingsThreshold
    });
  }

  // Mock functions for development
  async mockGenerateInvestmentSuggestions(params: InvestmentRecommendationParams): Promise<InvestmentSuggestion[]> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const suggestions: InvestmentSuggestion[] = [];

    // Generate suggestions based on risk profile and surplus
    if (params.surplusAmount < 500) {
      // Low surplus - suggest conservative options
      suggestions.push({
        id: '1',
        userId: 'user_demo',
        type: InvestmentType.FIXED_DEPOSIT,
        title: 'High-Yield Savings Account',
        description: 'Start with a secure high-yield savings account to build your emergency fund.',
        suggestedAmount: Math.min(params.surplusAmount, 300),
        expectedReturn: 3.5,
        riskLevel: RiskLevel.LOW,
        timeHorizon: TimeHorizon.SHORT_TERM,
        reasoning: 'Building an emergency fund is the first step in your investment journey.',
        status: SuggestionStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else if (params.surplusAmount < 2000) {
      // Medium surplus - balanced approach
      if (params.riskProfile === RiskProfile.CONSERVATIVE) {
        suggestions.push({
          id: '2',
          userId: 'user_demo',
          type: InvestmentType.BONDS,
          title: 'Government Bonds',
          description: 'Invest in government bonds for stable returns with low risk.',
          suggestedAmount: Math.floor(params.surplusAmount * 0.7),
          expectedReturn: 4.2,
          riskLevel: RiskLevel.LOW,
          timeHorizon: TimeHorizon.MEDIUM_TERM,
          reasoning: 'Your conservative risk profile suggests stable, government-backed investments.',
          status: SuggestionStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        suggestions.push({
          id: '3',
          userId: 'user_demo',
          type: InvestmentType.MUTUAL_FUND,
          title: 'Balanced Mutual Fund',
          description: 'Diversified mutual fund with balanced risk and return potential.',
          suggestedAmount: Math.floor(params.surplusAmount * 0.6),
          expectedReturn: 8.5,
          riskLevel: RiskLevel.MEDIUM,
          timeHorizon: TimeHorizon.MEDIUM_TERM,
          reasoning: 'A balanced approach matching your risk tolerance with good diversification.',
          status: SuggestionStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      suggestions.push({
        id: '4',
        userId: 'user_demo',
        type: InvestmentType.ETF,
        title: 'Index ETF',
        description: 'Low-cost index ETF for long-term wealth building.',
        suggestedAmount: Math.floor(params.surplusAmount * 0.3),
        expectedReturn: 7.2,
        riskLevel: RiskLevel.MEDIUM,
        timeHorizon: TimeHorizon.LONG_TERM,
        reasoning: 'Index ETFs provide broad market exposure with low fees.',
        status: SuggestionStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else {
      // High surplus - more diversified options
      if (params.riskProfile === RiskProfile.AGGRESSIVE) {
        suggestions.push({
          id: '5',
          userId: 'user_demo',
          type: InvestmentType.STOCKS,
          title: 'Growth Stocks Portfolio',
          description: 'Carefully selected growth stocks for high return potential.',
          suggestedAmount: Math.floor(params.surplusAmount * 0.4),
          expectedReturn: 12.0,
          riskLevel: RiskLevel.HIGH,
          timeHorizon: TimeHorizon.LONG_TERM,
          reasoning: 'Your aggressive risk profile allows for higher-risk, higher-reward investments.',
          status: SuggestionStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      suggestions.push({
        id: '6',
        userId: 'user_demo',
        type: InvestmentType.REAL_ESTATE,
        title: 'REIT Investment',
        description: 'Real Estate Investment Trust for property market exposure.',
        suggestedAmount: Math.floor(params.surplusAmount * 0.3),
        expectedReturn: 9.5,
        riskLevel: RiskLevel.MEDIUM,
        timeHorizon: TimeHorizon.LONG_TERM,
        reasoning: 'REITs provide real estate exposure with good liquidity.',
        status: SuggestionStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      suggestions.push({
        id: '7',
        userId: 'user_demo',
        type: InvestmentType.GOLD,
        title: 'Gold ETF',
        description: 'Gold ETF as a hedge against inflation and market volatility.',
        suggestedAmount: Math.floor(params.surplusAmount * 0.1),
        expectedReturn: 5.5,
        riskLevel: RiskLevel.LOW,
        timeHorizon: TimeHorizon.MEDIUM_TERM,
        reasoning: 'Gold provides portfolio diversification and inflation protection.',
        status: SuggestionStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return suggestions;
  }

  async mockCalculateSavingsProjection(currentIncome: number, currentExpenses: number, savingsThreshold: number): Promise<SavingsProjection> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const currentSavings = currentIncome - currentExpenses;
    const daysInMonth = new Date().getDate();
    const daysRemaining = 30 - daysInMonth;
    
    // Simple projection based on current trend
    const dailyIncome = currentIncome / 30;
    const dailyExpenses = currentExpenses / 30;
    const projectedIncome = dailyIncome * daysRemaining;
    const projectedExpenses = dailyExpenses * daysRemaining;
    
    const projectedMonthEndSavings = currentSavings + (projectedIncome - projectedExpenses);
    const surplusAmount = Math.max(0, projectedMonthEndSavings - savingsThreshold);
    
    return {
      currentSavings,
      projectedMonthEndSavings,
      surplusAmount,
      isAboveThreshold: projectedMonthEndSavings >= savingsThreshold,
      projectionConfidence: 85.5 // Mock confidence score
    };
  }

  async mockGetInvestmentSuggestions(): Promise<InvestmentSuggestion[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get from localStorage or return empty array
    const stored = localStorage.getItem('mock_investment_suggestions');
    return stored ? JSON.parse(stored) : [];
  }

  async mockAcceptSuggestion(suggestionId: string): Promise<{ message: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const suggestions = await this.mockGetInvestmentSuggestions();
    const updatedSuggestions = suggestions.map(s => 
      s.id === suggestionId 
        ? { ...s, status: SuggestionStatus.ACCEPTED, updatedAt: new Date() }
        : s
    );
    
    localStorage.setItem('mock_investment_suggestions', JSON.stringify(updatedSuggestions));
    
    return { message: 'Investment suggestion accepted successfully' };
  }

  async mockRejectSuggestion(suggestionId: string): Promise<{ message: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const suggestions = await this.mockGetInvestmentSuggestions();
    const updatedSuggestions = suggestions.map(s => 
      s.id === suggestionId 
        ? { ...s, status: SuggestionStatus.REJECTED, updatedAt: new Date() }
        : s
    );
    
    localStorage.setItem('mock_investment_suggestions', JSON.stringify(updatedSuggestions));
    
    return { message: 'Investment suggestion rejected' };
  }

  // Utility functions
  calculateExpectedAnnualReturn(investment: Investment): number {
    const monthsHeld = Math.max(1, (new Date().getTime() - investment.purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const monthlyReturn = investment.returnPercentage / monthsHeld;
    return monthlyReturn * 12;
  }

  getRiskLevelFromProfile(riskProfile: RiskProfile): RiskLevel {
    switch (riskProfile) {
      case RiskProfile.CONSERVATIVE:
        return RiskLevel.LOW;
      case RiskProfile.BALANCED:
        return RiskLevel.MEDIUM;
      case RiskProfile.AGGRESSIVE:
        return RiskLevel.HIGH;
      default:
        return RiskLevel.MEDIUM;
    }
  }

  getRecommendedTimeHorizon(age: number): TimeHorizon {
    if (age < 30) {
      return TimeHorizon.LONG_TERM;
    } else if (age < 50) {
      return TimeHorizon.MEDIUM_TERM;
    } else {
      return TimeHorizon.SHORT_TERM;
    }
  }

  calculatePortfolioMetrics(portfolio: InvestmentPortfolio): {
    totalReturn: number;
    totalReturnPercentage: number;
    averageReturnPercentage: number;
    riskScore: number;
  } {
    const totalReturn = portfolio.totalValue - portfolio.totalInvested;
    const totalReturnPercentage = portfolio.totalInvested > 0 
      ? (totalReturn / portfolio.totalInvested) * 100 
      : 0;
    
    const averageReturnPercentage = portfolio.investments.length > 0
      ? portfolio.investments.reduce((sum, inv) => sum + inv.returnPercentage, 0) / portfolio.investments.length
      : 0;
    
    // Simple risk score calculation based on investment types
    const riskScore = portfolio.investments.reduce((score, inv) => {
      switch (inv.type) {
        case InvestmentType.STOCKS:
        case InvestmentType.CRYPTO:
          return score + 3;
        case InvestmentType.MUTUAL_FUND:
        case InvestmentType.ETF:
        case InvestmentType.REAL_ESTATE:
          return score + 2;
        case InvestmentType.BONDS:
        case InvestmentType.GOLD:
          return score + 1;
        default:
          return score;
      }
    }, 0) / portfolio.investments.length;

    return {
      totalReturn,
      totalReturnPercentage,
      averageReturnPercentage,
      riskScore
    };
  }
}

export const investmentService = new InvestmentService();
export default investmentService;
