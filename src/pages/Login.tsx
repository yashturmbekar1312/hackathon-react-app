import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { LoginCredentials } from "../types/auth.types";
import logo from "../assets/images/logo.png";
import { toast } from "sonner";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(formData);
      toast.success("Login Successful", {
        description: "Welcome back!",
      });
      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      toast.error("Login Failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setFormData({
      email: "demo@wealthify.com",
      password: "password",
    });

    // Automatically submit with demo credentials
    setIsLoading(true);
    setError(null);

    try {
      await login({
        email: "demo@wealthify.com",
        password: "password",
      });
      toast.success("Demo Login Successful", {
        description: "Welcome to the demo!",
      });
      navigate("/dashboard");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Demo login failed";
      setError(errorMessage);
      toast.error("Demo Login Failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-success-50/30 bg-mesh flex items-center justify-center px-4 animate-fade-in">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-brand-400/20 to-success-400/20 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-success-400/20 to-brand-400/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card variant="glass" className="overflow-hidden animate-scale-in">
          {/* Header */}
          <CardHeader className="text-center bg-gradient-to-br from-white via-white to-brand-50/30 border-b border-white/20">
            <div className="flex justify-center mb-4">
              <div className="relative group">
                <img
                  src={logo}
                  alt="Wealthify Logo"
                  className="h-16 w-auto transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-brand-500/20 to-success-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gradient mb-2">
              Welcome to Wealthify
            </CardTitle>
            <CardDescription className="text-base">
              Smart Salary & Investment Management Platform
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-gradient-to-r from-danger-50 to-danger-100 border border-danger-200 rounded-xl p-4 animate-slide-down">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-danger-600 mr-3 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm font-medium text-danger-700">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  variant="default"
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  }
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  variant="default"
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  }
                />
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-neutral-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-neutral-500 font-medium">
                    Or
                  </span>
                </div>
              </div>

              {/* Demo Button */}
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleDemoLogin}
                disabled={isLoading}
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                }
              >
                Try Demo Account
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-neutral-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-brand-600 hover:text-brand-700 transition-colors duration-200"
                >
                  Sign up
                </Link>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gradient-to-br from-brand-50 to-success-50 rounded-xl border border-brand-200/50">
              <h3 className="text-sm font-semibold text-brand-900 mb-3 flex items-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Demo Credentials
              </h3>
              <div className="space-y-1">
                <p className="text-xs text-brand-700">
                  <span className="font-medium">Email:</span> demo@wealthify.com
                </p>
                <p className="text-xs text-brand-700">
                  <span className="font-medium">Password:</span> password
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-neutral-500">
          <p>© 2025 Wealthify. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
