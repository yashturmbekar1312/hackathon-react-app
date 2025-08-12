import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import {
  AuthState,
  User,
  LoginCredentials,
  SignupData,
} from "../types/auth.types";
import { authService } from "../services/auth.service";
import { validateAuthData, clearAuthData } from "../utils/authDebug";

// Auth Context
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (signupData: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  sendOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
}

// Auth Actions
type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; token: string } }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; payload: User }
  | { type: "SET_LOADING"; payload: boolean };

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        ...state,
        isLoading: true,
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage - WITH VALIDATION
  useEffect(() => {
    console.log("🔍 AuthContext: Starting initialization with validation...");

    try {
      // First, validate if existing auth data is good
      if (!validateAuthData()) {
        console.log("❌ AuthContext: Invalid auth data found, clearing...");
        clearAuthData();
        dispatch({ type: "SET_LOADING", payload: false });
        return;
      }

      const token = authService.getToken();
      const storedUser = authService.getStoredUser();

      if (token && storedUser) {
        console.log("✅ AuthContext: Valid stored auth found, logging in");
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { user: storedUser, token },
        });
      } else {
        console.log("❌ AuthContext: No stored auth found");
        dispatch({ type: "SET_LOADING", payload: false });
      }
    } catch (error) {
      console.error("❌ AuthContext: Error during initialization:", error);
      clearAuthData();
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      dispatch({ type: "LOGIN_START" });

      // Use ONLY actual Railway API for login - no mocks
      console.log("🔐 AuthContext: Starting login process...");
      const response = await authService.login(credentials);
      console.log("🔐 AuthContext: AuthService response:", response);

      // Check if we got proper response structure
      if (!response.token) {
        console.error("❌ AuthContext: No token in response!", response);
        throw new Error("Login failed: No token received from server");
      }

      if (!response.user) {
        console.error("❌ AuthContext: No user in response!", response);
        throw new Error("Login failed: No user data received from server");
      }

      console.log(
        "✅ AuthContext: Login successful, dispatching success action"
      );
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: response.user, token: response.token },
      });

      // Verify the state was updated
      setTimeout(() => {
        const storedToken = localStorage.getItem("wealthify_token");
        console.log(
          "🔍 AuthContext: Token verification after login:",
          storedToken ? storedToken.substring(0, 20) + "..." : "NO TOKEN"
        );
      }, 100);
    } catch (error) {
      console.error("❌ AuthContext: Login failed:", error);
      dispatch({
        type: "LOGIN_FAILURE",
        payload: error instanceof Error ? error.message : "Login failed",
      });
      throw error;
    }
  };

  // Register function
  const register = async (signupData: SignupData): Promise<void> => {
    try {
      dispatch({ type: "LOGIN_START" });

      // Use ONLY actual Railway API for registration - no mocks
      const response = await authService.register(signupData);
      console.log("API registration successful:", response);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: response.user, token: response.token },
      });
    } catch (error) {
      console.error("API registration failed:", error);
      dispatch({
        type: "LOGIN_FAILURE",
        payload: error instanceof Error ? error.message : "Registration failed",
      });
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();

      // Manually clear localStorage to ensure complete logout
      localStorage.removeItem("wealthify_token");
      localStorage.removeItem("wealthify_user");
      console.log("Cleared authentication data from localStorage");

      dispatch({ type: "LOGOUT" });
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if API call fails
      localStorage.removeItem("wealthify_token");
      localStorage.removeItem("wealthify_user");
      dispatch({ type: "LOGOUT" });
    }
  };

  // Update profile function
  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      dispatch({ type: "UPDATE_USER", payload: updatedUser });
    } catch (error) {
      throw error;
    }
  };

  // Send OTP function
  const sendOTP = async (email: string): Promise<void> => {
    try {
      // Use mock OTP for development
      await authService.mockSendOTP(email);
    } catch (error) {
      throw error;
    }
  };

  // Verify OTP function
  const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
    try {
      // Use mock OTP verification for development
      const response = await authService.mockVerifyOTP({ email, otp });
      return response.isValid;
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    sendOTP,
    verifyOTP,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
