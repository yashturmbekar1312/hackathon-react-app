import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { SignupData, RiskProfile } from '../types/auth.types';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { register, sendOTP, verifyOTP } = useAuth();
  const [step, setStep] = useState<'email' | 'otp' | 'profile'>('email');
  const [formData, setFormData] = useState<SignupData>({
    email: '',
    password: '',
    name: '',
    currency: 'USD',
    riskProfile: RiskProfile.BALANCED,
    savingsThreshold: 1000,
  });
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'savingsThreshold' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await sendOTP(formData.email);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const isValid = await verifyOTP(formData.email, otp);
      if (isValid) {
        setStep('profile');
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleEmailSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email Address
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange}
          required
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={handleInputChange}
          required
          minLength={6}
          className="w-full"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Sending OTP...' : 'Send OTP'}
      </Button>
    </form>
  );

  const renderOTPStep = () => (
    <form onSubmit={handleOTPSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="otp" className="text-sm font-medium text-gray-700">
          Enter OTP
        </label>
        <Input
          id="otp"
          name="otp"
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          maxLength={6}
          className="w-full text-center text-2xl tracking-widest"
        />
        <p className="text-xs text-gray-500">
          OTP sent to {formData.email}
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-sm text-blue-700">
          <strong>Demo OTP:</strong> 123456
        </p>
      </div>

      <div className="flex space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep('email')}
          className="flex-1"
        >
          Back
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? 'Verifying...' : 'Verify OTP'}
        </Button>
      </div>
    </form>
  );

  const renderProfileStep = () => (
    <form onSubmit={handleProfileSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          Full Name
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="currency" className="text-sm font-medium text-gray-700">
          Preferred Currency
        </label>
        <select
          id="currency"
          name="currency"
          value={formData.currency}
          onChange={handleInputChange}
          required
          className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="USD">USD - US Dollar</option>
          <option value="EUR">EUR - Euro</option>
          <option value="GBP">GBP - British Pound</option>
          <option value="INR">INR - Indian Rupee</option>
          <option value="CAD">CAD - Canadian Dollar</option>
          <option value="AUD">AUD - Australian Dollar</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="riskProfile" className="text-sm font-medium text-gray-700">
          Investment Risk Profile
        </label>
        <select
          id="riskProfile"
          name="riskProfile"
          value={formData.riskProfile}
          onChange={handleInputChange}
          required
          className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value={RiskProfile.CONSERVATIVE}>Conservative - Low risk, stable returns</option>
          <option value={RiskProfile.BALANCED}>Balanced - Moderate risk, balanced growth</option>
          <option value={RiskProfile.AGGRESSIVE}>Aggressive - High risk, high potential returns</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="savingsThreshold" className="text-sm font-medium text-gray-700">
          Monthly Savings Threshold
        </label>
        <Input
          id="savingsThreshold"
          name="savingsThreshold"
          type="number"
          placeholder="Enter minimum savings amount"
          value={formData.savingsThreshold}
          onChange={handleInputChange}
          required
          min={0}
          step={50}
          className="w-full"
        />
        <p className="text-xs text-gray-500">
          Minimum amount you want to save each month
        </p>
      </div>

      <div className="flex space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep('otp')}
          className="flex-1"
        >
          Back
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </div>
    </form>
  );

  const getStepTitle = () => {
    switch (step) {
      case 'email':
        return 'Create Your Account';
      case 'otp':
        return 'Verify Your Email';
      case 'profile':
        return 'Complete Your Profile';
      default:
        return 'Sign Up';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'email':
        return 'Enter your email and create a password';
      case 'otp':
        return 'We sent a verification code to your email';
      case 'profile':
        return 'Tell us about your financial preferences';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {getStepTitle()}
            </CardTitle>
            <CardDescription>
              {getStepDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'email' && renderEmailStep()}
            {step === 'otp' && renderOTPStep()}
            {step === 'profile' && renderProfileStep()}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
