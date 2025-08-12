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
import { STORAGE_KEYS } from "../api/config";

// Utility functions for auth data validation and cleanup
const validateAuthData = (): boolean => {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const userStr = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);

    if (!token || !userStr) {
      return false;
    }

    // Try to parse user data
    const user = JSON.parse(userStr);
    if (!user || !user.id || !user.email) {
      return false;
    }

    // Check if token is expired (basic check - decode JWT would be more thorough)
    // For now, just check if token exists and has proper format
    if (token.length < 10) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

const clearAuthData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
  } catch (error) {
    // Silent error handling
  }
};

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
    try {
      // First, validate if existing auth data is good
      if (!validateAuthData()) {
        clearAuthData();
        dispatch({ type: "SET_LOADING", payload: false });
        return;
      }

      const token = authService.getToken();
      const storedUser = authService.getStoredUser();

      if (token && storedUser) {
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { user: storedUser, token },
        });
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    } catch (error) {
      clearAuthData();
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      dispatch({ type: "LOGIN_START" });

      // Use ONLY actual Railway API for login - no mocks
      const response = await authService.login(credentials);

      // Check if we got proper response structure
      if (!response.token) {
        throw new Error("Login failed: No token received from server");
      }

      if (!response.user) {
        throw new Error("Login failed: No user data received from server");
      }

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: response.user, token: response.token },
      });
    } catch (error) {
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

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: response.user, token: response.token },
      });
    } catch (error) {
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
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);

      dispatch({ type: "LOGOUT" });
    } catch (error) {
      // Force logout even if API call fails
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
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
