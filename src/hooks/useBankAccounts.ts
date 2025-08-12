import { useState, useEffect } from "react";
import { accountApiService } from "../api/endpoints/account.api";
import {
  BankAccount,
  LinkAccountRequest,
  UpdateAccountRequest,
} from "../types/account.types";
import { toast } from "sonner";

export const useBankAccounts = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all linked accounts
  const fetchAccounts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const accountsData = await accountApiService.getLinkedAccounts();
      setAccounts(accountsData);
    } catch (err: any) {
      setError(err.message || "Failed to fetch accounts");
      } finally {
      setIsLoading(false);
    }
  };

  // Link a new bank account
  const linkAccount = async (
    accountData: LinkAccountRequest
  ): Promise<BankAccount | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const newAccount = await accountApiService.linkBankAccount(accountData);
      setAccounts((prev) => [...prev, newAccount]);
      toast.success("Bank account linked successfully!");
      return newAccount;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to link bank account";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update bank account
  const updateAccount = async (
    accountId: string,
    updateData: UpdateAccountRequest
  ): Promise<BankAccount | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedAccount = await accountApiService.updateBankAccount(
        accountId,
        updateData
      );
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === accountId ? updatedAccount : acc))
      );
      toast.success("Account updated successfully!");
      return updatedAccount;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update account";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete bank account
  const deleteAccount = async (accountId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await accountApiService.deleteBankAccount(accountId);
      setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
      toast.success("Account deleted successfully!");
      return true;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete account";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has any linked accounts
  const hasLinkedAccounts = accounts.length > 0;

  // Get active accounts only
  const activeAccounts = accounts.filter((acc) => acc.isActive);

  useEffect(() => {
    fetchAccounts();
  }, []);

  return {
    accounts,
    activeAccounts,
    hasLinkedAccounts,
    isLoading,
    error,
    linkAccount,
    updateAccount,
    deleteAccount,
    refreshAccounts: fetchAccounts,
  };
};

