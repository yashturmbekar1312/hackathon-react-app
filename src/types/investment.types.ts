import { RiskProfile } from './auth.types';

export interface InvestmentSuggestion {
  id: string;
  userId: string;
  type: InvestmentType;
  title: string;
  description: string;
  suggestedAmount: number;
  expectedReturn: number;
  riskLevel: RiskLevel;
  timeHorizon: TimeHorizon;
  reasoning: string;
  status: SuggestionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvestmentPortfolio {
  id: string;
  userId: string;
  totalValue: number;
  totalInvested: number;
  totalReturns: number;
  returnPercentage: number;
  investments: Investment[];
  lastUpdated: Date;
}

export interface Investment {
  id: string;
  portfolioId: string;
  type: InvestmentType;
  name: string;
  symbol?: string;
  investedAmount: number;
  currentValue: number;
  returns: number;
  returnPercentage: number;
  quantity: number;
  purchaseDate: Date;
  lastUpdated: Date;
}

export enum InvestmentType {
  MUTUAL_FUND = 'mutual_fund',
  ETF = 'etf',
  STOCKS = 'stocks',
  BONDS = 'bonds',
  FIXED_DEPOSIT = 'fixed_deposit',
  GOLD = 'gold',
  CRYPTO = 'crypto',
  REAL_ESTATE = 'real_estate'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum TimeHorizon {
  SHORT_TERM = 'short_term', // < 1 year
  MEDIUM_TERM = 'medium_term', // 1-5 years
  LONG_TERM = 'long_term' // > 5 years
}

export enum SuggestionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export interface SavingsProjection {
  currentSavings: number;
  projectedMonthEndSavings: number;
  surplusAmount: number;
  isAboveThreshold: boolean;
  projectionConfidence: number;
}

export interface InvestmentRecommendationParams {
  surplusAmount: number;
  riskProfile: RiskProfile;
  age: number;
  monthlyIncome: number;
  existingInvestments: number;
  timeHorizon: TimeHorizon;
}
