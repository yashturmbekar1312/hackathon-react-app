import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'sonner';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import SalaryManagement from './pages/SalaryManagement';
import ExpenseTracking from './pages/ExpenseTracking';
import InvestmentSuggestions from './pages/InvestmentSuggestions';

// Import debug utilities
import './utils/debug';
// import HealthCheck from './components/HealthCheck';
// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user, token } = useAuth();

  console.log('🛡️ ProtectedRoute: Current auth state:', { 
    isAuthenticated, 
    isLoading, 
    hasUser: !!user, 
    hasToken: !!token 
  });

  if (isLoading) {
    console.log('🛡️ ProtectedRoute: Still loading, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication and redirect if needed
  console.log('🛡️ ProtectedRoute: isAuthenticated =', isAuthenticated);
  
  if (isAuthenticated) {
    console.log('🛡️ ProtectedRoute: User is authenticated, rendering children');
    return <>{children}</>;
  } else {
    console.log('🛡️ ProtectedRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          {/* <HealthCheck /> */}
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/salary"
              element={
                <ProtectedRoute>
                  <SalaryManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <ProtectedRoute>
                  <ExpenseTracking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/investments"
              element={
                <ProtectedRoute>
                  <InvestmentSuggestions />
                </ProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </AuthProvider>
      <Toaster />
    </Router>
  );
};

export default App;
