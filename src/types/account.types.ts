export interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  accountType: AccountType;
  bankName: string;
  balance: number;
  currencyCode: string;
  bankAggregatorId?: string;
  externalAccountId?: string;
  consentExpiresAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LinkAccountRequest {
  accountName: string;
  accountNumber: string;
  accountType: AccountType;
  bankName: string;
  balance: number;
  currencyCode: string;
  bankAggregatorId?: string;
  externalAccountId?: string;
  consentExpiresAt?: string;
}

export interface UpdateAccountRequest {
  accountName: string;
  balance: number;
  isActive: boolean;
}

export enum AccountType {
  SAVINGS = "SAVINGS",
  CHECKING = "CHECKING",
  CREDIT = "CREDIT",
  CURRENT = "CURRENT",
}

export interface AccountSummary {
  id: string;
  accountName: string;
  bankName: string;
  accountType: AccountType;
  balance: number;
  currencyCode: string;
  isActive: boolean;
}
