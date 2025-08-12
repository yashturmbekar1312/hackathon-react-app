import { STORAGE_KEYS } from "../api/config";

// Clear localStorage utility for debugging
export const clearAuthData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    console.log("✅ Cleared authentication data");
  } catch (error) {
    console.error("❌ Error clearing auth data:", error);
  }
};

// Check if auth data is corrupted
export const validateAuthData = () => {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const userStr = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);

    if (token && userStr) {
      const user = JSON.parse(userStr);
      if (user && user.id && user.email && user.name) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("❌ Auth data validation error:", error);
    return false;
  }
};

// Force clear corrupted data
export const forceResetAuth = () => {
  console.log("🔧 Force resetting authentication...");
  clearAuthData();
  window.location.href = "/login";
};
