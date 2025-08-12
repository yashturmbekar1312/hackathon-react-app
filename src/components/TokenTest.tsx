import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { apiClient } from "../api/client";
import { STORAGE_KEYS } from "../api/config";

const TokenTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const testTokenHeaders = async () => {
    setIsLoading(true);
    setTestResult("");

    try {
      // Check what's in localStorage
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const user = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      
      console.log("🔍 Token Test - Current Storage:");
      console.log("Access Token:", token ? token.substring(0, 30) + "..." : "NOT FOUND");
      console.log("User Profile:", user ? "Found" : "NOT FOUND");

      if (!token) {
        setTestResult("❌ No access token found in localStorage");
        return;
      }

      // Test API call to see if token is being sent
      const response = await apiClient.get('/users/profile');
      
      setTestResult(`✅ Token is working! API Response: ${JSON.stringify(response, null, 2)}`);
      
    } catch (error: any) {
      console.error("Token test failed:", error);
      setTestResult(`❌ Token test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearStorage = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    setTestResult("🧹 Storage cleared");
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">Bearer Token Test</h3>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testTokenHeaders} disabled={isLoading}>
            {isLoading ? "Testing..." : "Test API with Token"}
          </Button>
          <Button variant="outline" onClick={clearStorage}>
            Clear Storage
          </Button>
        </div>

        {testResult && (
          <div className="bg-gray-100 p-4 rounded-md">
            <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>This component tests if bearer tokens are being sent correctly with API requests.</p>
          <p>Current storage keys being used:</p>
          <ul className="mt-1">
            <li>• Access Token: {STORAGE_KEYS.ACCESS_TOKEN}</li>
            <li>• Refresh Token: {STORAGE_KEYS.REFRESH_TOKEN}</li>
            <li>• User Profile: {STORAGE_KEYS.USER_PROFILE}</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default TokenTest;
