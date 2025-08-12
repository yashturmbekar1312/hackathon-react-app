import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { authApiService } from '../api/endpoints/auth.api';
import { toast } from "sonner";
import { Eye, EyeOff } from 'lucide-react';
import logo from '../assets/images/logo.png';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

// Validation schemas
const registerValidationSchema = Yup.object({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .required('Last name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  phoneNumber: Yup.string()
    .matches(/^[+]?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number')
    .required('Phone number is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
    .matches(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
    .matches(/(?=.*\d)/, 'Password must contain at least one number')
    .matches(/(?=.*[@$!%*?&])/, 'Password must contain at least one special character')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Password confirmation is required'),
});

const otpValidationSchema = Yup.object({
  otpCode: Yup.string()
    .length(6, 'OTP must be 6 digits')
    .matches(/^\d+$/, 'OTP must contain only numbers')
    .required('OTP is required'),
});

const Signup: React.FC = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'register' | 'otp' | 'success'>('register');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState('');

  // Handle registration form submission
  const handleRegistrationSubmit = async (values: RegisterFormData) => {
    setIsLoading(true);
    try {
      await authApiService.register({
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
        acceptTerms: true,
        marketingConsent: false,
      });
      
      setRegistrationEmail(values.email);
      toast.success('Registration Successful', {
        description: 'Please check your email for the OTP code.'
      });
      setStep('otp');
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error('Registration Failed', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleOtpSubmit = async (values: { otpCode: string }) => {
    setIsLoading(true);
    try {
      await authApiService.verifyOTP({
        email: registrationEmail,
        otpCode: values.otpCode,
        otpType: 'email_verification',
      });
      
      toast.success('Email Verified', {
        description: 'Your account has been successfully created!'
      });
      setStep('success');
    } catch (error: any) {
      console.error('OTP verification error:', error);
      const errorMessage = error.response?.data?.message || 'OTP verification failed. Please try again.';
      toast.error('Verification Failed', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompletion = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <img src={logo} alt="logo" style={{ width: '150px', height: '100%', margin: '0 auto' }} />
          <CardTitle className="text-2xl font-bold">
            {step === 'register' ? 'Create Account' : 
             step === 'otp' ? 'Verify Email' : 
             'Welcome!'}
          </CardTitle>
          <CardDescription>
            {step === 'register' ? 'Join thousands managing their finances smarter' :
             step === 'otp' ? 'We need to verify your email address' :
             'Your account is ready to use'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Registration Form */}
          {step === 'register' && (
            <Formik
              initialValues={{
                firstName: '',
                lastName: '',
                email: '',
                phoneNumber: '',
                password: '',
                confirmPassword: '',
              }}
              validationSchema={registerValidationSchema}
              onSubmit={handleRegistrationSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form className="space-y-4">
                  {/* First Name */}
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <Field
                      as={Input}
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="Enter your first name"
                      className={errors.firstName && touched.firstName ? 'border-red-500' : ''}
                    />
                    <ErrorMessage name="firstName" component="div" className="text-sm text-red-600" />
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <Field
                      as={Input}
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Enter your last name"
                      className={errors.lastName && touched.lastName ? 'border-red-500' : ''}
                    />
                    <ErrorMessage name="lastName" component="div" className="text-sm text-red-600" />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <Field
                      as={Input}
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      className={errors.email && touched.email ? 'border-red-500' : ''}
                    />
                    <ErrorMessage name="email" component="div" className="text-sm text-red-600" />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <Field
                      as={Input}
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="Enter your phone number"
                      className={errors.phoneNumber && touched.phoneNumber ? 'border-red-500' : ''}
                    />
                    <ErrorMessage name="phoneNumber" component="div" className="text-sm text-red-600" />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <Field
                        as={Input}
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        className={errors.password && touched.password ? 'border-red-500 pr-10' : 'pr-10'}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <ErrorMessage name="password" component="div" className="text-sm text-red-600" />
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Password must contain:</p>
                      <ul className="list-disc list-inside space-y-0.5 ml-2">
                        <li>At least 8 characters</li>
                        <li>One uppercase letter</li>
                        <li>One lowercase letter</li>
                        <li>One number</li>
                        <li>One special character (@$!%*?&)</li>
                      </ul>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Field
                        as={Input}
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        className={errors.confirmPassword && touched.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <ErrorMessage name="confirmPassword" component="div" className="text-sm text-red-600" />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </Form>
              )}
            </Formik>
          )}

          {/* OTP Verification Form */}
          {step === 'otp' && (
            <Formik
              initialValues={{ otpCode: '' }}
              validationSchema={otpValidationSchema}
              onSubmit={handleOtpSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="otpCode" className="text-sm font-medium text-gray-700">
                      Enter OTP Code
                    </label>
                    <Field
                      as={Input}
                      id="otpCode"
                      name="otpCode"
                      type="text"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className={errors.otpCode && touched.otpCode ? 'border-red-500' : ''}
                    />
                    <ErrorMessage name="otpCode" component="div" className="text-sm text-red-600" />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || isLoading}
                  >
                    {isLoading ? 'Verifying...' : 'Verify Email'}
                  </Button>
                </Form>
              )}
            </Formik>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Account Created Successfully!</h3>
              <p className="text-gray-600">Your account has been verified and is ready to use.</p>
              <Button onClick={handleCompletion} className="w-full">
                Continue to Login
              </Button>
            </div>
          )}

          {/* Login Link */}
          {step === 'register' && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
