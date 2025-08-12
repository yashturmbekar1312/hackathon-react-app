// Clear localStorage utility for debugging
export const clearAuthData = () => {
  try {
    localStorage.removeItem("wealthify_token");
    localStorage.removeItem("wealthify_user");
    console.log("✅ Cleared authentication data");
  } catch (error) {
    console.error("❌ Error clearing auth data:", error);
  }
};

// Check if auth data is corrupted
export const validateAuthData = () => {
  try {
    const token = localStorage.getItem("wealthify_token");
    const userStr = localStorage.getItem("wealthify_user");

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
