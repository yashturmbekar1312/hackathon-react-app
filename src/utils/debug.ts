// Debug utilities for troubleshooting authentication issues
import { STORAGE_KEYS } from "../api/config";

export const debugAuth = () => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const user = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  
  console.log('🔍 DEBUG: Auth State Check');
  console.log('📝 Token:', token ? `${token.substring(0, 30)}...` : 'NO TOKEN');
  console.log('👤 User:', user ? JSON.parse(user) : 'NO USER');
  console.log('🔗 API Base URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api');
  
  return {
    hasToken: !!token,
    hasUser: !!user,
    token: token ? token.substring(0, 30) + '...' : null,
    user: user ? JSON.parse(user) : null
  };
};

export const testAPICall = async () => {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    console.log('🧪 Testing API call with token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
    
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/transactions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('🧪 API Test Response Status:', response.status);
    console.log('🧪 API Test Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('🧪 API Test Response Body:', data);
    
    return { status: response.status, data };
  } catch (error) {
    console.error('🧪 API Test Failed:', error);
    return { error };
  }
};

// Add to window for easy access in console
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuth;
  (window as any).testAPICall = testAPICall;
}
