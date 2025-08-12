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

    console.log('🔐 Login: Form submitted with data:', formData);

    try {
      console.log('🔐 Login: Calling login function...');
      await login(formData);
      console.log('🔐 Login: Login function completed successfully');
      toast.success("Login Successful", {
        description: "Welcome back!",
      });
      navigate("/dashboard");
    } catch (err) {
      console.error('🔐 Login: Login failed with error:', err);
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      toast.error("Login Failed", {
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

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="Wealthify"
            className="h-12 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-brand-dark">Welcome Back</h1>
          <p className="text-brand-muted mt-2">
            Sign in to your Wealthify account
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="backdrop-blur-md bg-white/80 border-white/20 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold text-brand-dark">
              Sign In
            </CardTitle>
            <CardDescription className="text-sm text-brand-muted">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <Input
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
              />

              {/* Password Input */}
              <Input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />

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
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
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
