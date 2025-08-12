import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useBankAccounts } from "../hooks/useBankAccounts";
import { LinkAccountRequest, AccountType } from "../types/account.types";
import { toast } from "sonner";

interface BankAccountManagerProps {
  onAccountLinked?: () => void;
}

const BankAccountManager: React.FC<BankAccountManagerProps> = ({
  onAccountLinked,
}) => {
  const { accounts, activeAccounts, isLoading, linkAccount, deleteAccount } =
    useBankAccounts();
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [formData, setFormData] = useState<LinkAccountRequest>({
    accountName: "",
    accountNumber: "",
    accountType: AccountType.SAVINGS,
    bankName: "",
    balance: 0,
    currencyCode: "USD",
  });

  const handleInputChange = (
    field: keyof LinkAccountRequest,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.accountName.trim()) {
      toast.error("Please enter account name");
      return;
    }

    if (!formData.accountNumber.trim()) {
      toast.error("Please enter account number");
      return;
    }

    if (!formData.bankName.trim()) {
      toast.error("Please enter bank name");
      return;
    }

    if (formData.balance < 0) {
      toast.error("Balance cannot be negative");
      return;
    }

    const success = await linkAccount(formData);
    if (success) {
      setFormData({
        accountName: "",
        accountNumber: "",
        accountType: AccountType.SAVINGS,
        bankName: "",
        balance: 0,
        currencyCode: "USD",
      });
      setShowLinkForm(false);
      onAccountLinked?.();
    }
  };

  const handleDeleteAccount = async (
    accountId: string,
    accountName: string
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${accountName}"? This action cannot be undone.`
    );
    if (confirmed) {
      await deleteAccount(accountId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Bank Accounts</CardTitle>
            <p className="text-sm text-brand-muted mt-1">
              Link your bank accounts to manage expenses and budgets
            </p>
          </div>
          {!showLinkForm && (
            <Button onClick={() => setShowLinkForm(true)} disabled={isLoading}>
              Link Account
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Link Account Form */}
        {showLinkForm && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-brand-dark mb-4">
              Link New Bank Account
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">
                    Account Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.accountName}
                    onChange={(e) =>
                      handleInputChange("accountName", e.target.value)
                    }
                    placeholder="My Primary Account"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">
                    Bank Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) =>
                      handleInputChange("bankName", e.target.value)
                    }
                    placeholder="Bank of America"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">
                    Account Number *
                  </label>
                  <Input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) =>
                      handleInputChange("accountNumber", e.target.value)
                    }
                    placeholder="****1234"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">
                    Account Type
                  </label>
                  <select
                    value={formData.accountType}
                    onChange={(e) =>
                      handleInputChange("accountType", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  >
                    <option value={AccountType.SAVINGS}>Savings Account</option>
                    <option value={AccountType.CHECKING}>
                      Checking Account
                    </option>
                    <option value={AccountType.CURRENT}>Current Account</option>
                    <option value={AccountType.CREDIT}>Credit Account</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">
                    Current Balance
                  </label>
                  <Input
                    type="number"
                    value={formData.balance || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "balance",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.currencyCode}
                    onChange={(e) =>
                      handleInputChange("currencyCode", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="INR">INR - Indian Rupee</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Linking..." : "Link Account"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowLinkForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Accounts */}
        {accounts.length > 0 ? (
          <div className="space-y-3">
            <h3 className="font-medium text-brand-dark">Linked Accounts</h3>
            {accounts.map((account) => (
              <div
                key={account.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-brand-dark">
                        {account.accountName}
                      </h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          account.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {account.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-brand-muted mt-1">
                      {account.bankName} • {account.accountType} • ****
                      {account.accountNumber.slice(-4)}
                    </p>
                    <p className="text-sm font-medium text-brand-dark mt-1">
                      Balance: {account.currencyCode}{" "}
                      {account.balance.toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      handleDeleteAccount(account.id, account.accountName)
                    }
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : !showLinkForm ? (
          <div className="text-center py-8 text-brand-muted">
            <p>No bank accounts linked yet.</p>
            <p className="text-sm">
              Link your first account to start managing expenses and budgets!
            </p>
          </div>
        ) : null}

        {/* Requirements Notice */}
        {activeAccounts.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="text-amber-600 mt-0.5">⚠️</div>
              <div>
                <h4 className="font-medium text-amber-800">Account Required</h4>
                <p className="text-sm text-amber-700 mt-1">
                  You need to link at least one bank account before you can add
                  expenses or create budgets.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BankAccountManager;
