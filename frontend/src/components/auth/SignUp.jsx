import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Alert, AlertDescription } from '../ui/Alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, Chrome, CheckCircle } from 'lucide-react';

const SignUp = () => {
  const navigate = useNavigate();
  const { sendSignupOtp, verifySignupOtp, isLoading, error, clearError, isAuthenticated } = useAuth();

  const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification, 3: Success
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'fleet_manager'
  });
  const [otpData, setOtpData] = useState({
    otp: '',
    countdown: 0,
    canResend: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (otpData.countdown > 0) {
      timer = setInterval(() => {
        setOtpData(prev => ({
          ...prev,
          countdown: prev.countdown - 1,
          canResend: prev.countdown <= 1
        }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpData.countdown]);

  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateOtp = () => {
    if (!otpData.otp || otpData.otp.length !== 6) {
      return 'Please enter a valid 6-digit OTP';
    }
    return null;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtpData(prev => ({ ...prev, otp: value }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      clearError();
      
      await sendSignupOtp(formData.email, formData.firstName);
      
      setStep(2);
      setOtpData(prev => ({
        ...prev,
        countdown: 60,
        canResend: false
      }));
    } catch (error) {
      console.error('Failed to send OTP:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    const otpError = validateOtp();
    if (otpError) {
      setValidationErrors({ otp: otpError });
      return;
    }

    try {
      setIsSubmitting(true);
      clearError();
      
      await verifySignupOtp(formData.email, otpData.otp, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        role: formData.role
      });
      
      setStep(3);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('OTP verification failed:', error);
      setValidationErrors({ otp: 'Invalid OTP. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!otpData.canResend) return;

    try {
      clearError();
      await sendSignupOtp(formData.email, formData.firstName);
      
      setOtpData(prev => ({
        ...prev,
        otp: '',
        countdown: 60,
        canResend: false
      }));
      setValidationErrors({});
    } catch (error) {
      console.error('Failed to resend OTP:', error);
    }
  };



  // Step 1: Registration Form
  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -right-4 w-72 h-72 bg-gradient-to-br from-emerald-200/40 to-teal-300/40 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-gradient-to-br from-teal-200/40 to-cyan-300/40 rounded-full blur-3xl"></div>
        </div>
        
        <Card className="w-full max-w-md shadow-2xl bg-white/95 backdrop-blur-sm border border-gray-200 rounded-3xl relative z-10">
          <CardHeader className="space-y-6 text-center pb-8 pt-8">
            <div className="flex justify-center mb-4">
              <img 
                src="/src/assets/ev-repair-logo.923ecc755fed70eb61ca (1).png" 
                alt="Roll & Charge Fleet Management" 
                className="w-32 h-auto" 
              />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Create Account</CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              Join Roll & Charge Fleet Management
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={validationErrors.firstName ? 'border-red-500' : ''}
                    disabled={isLoading || isSubmitting}
                  />
                  {validationErrors.firstName && (
                    <p className="text-sm text-red-600">{validationErrors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={validationErrors.lastName ? 'border-red-500' : ''}
                    disabled={isLoading || isSubmitting}
                  />
                  {validationErrors.lastName && (
                    <p className="text-sm text-red-600">{validationErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pl-10 ${validationErrors.email ? 'border-red-500' : ''}`}
                    disabled={isLoading || isSubmitting}
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-sm text-red-600">{validationErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, role: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fleet_manager">Fleet Manager</SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                    <SelectItem value="driver">Driver</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 ${validationErrors.password ? 'border-red-500' : ''}`}
                    disabled={isLoading || isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-sm text-red-600">{validationErrors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 ${validationErrors.confirmPassword ? 'border-red-500' : ''}`}
                    disabled={isLoading || isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-sm text-red-600">{validationErrors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                disabled={isLoading || isSubmitting}
              >
                {isSubmitting ? 'Sending OTP...' : 'Send Verification Code'}
              </Button>
            </form>
          </CardContent>

          <CardFooter>
            <p className="text-center text-sm text-gray-600 w-full">
              Already have an account?{' '}
              <Link 
                to="/signin" 
                className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Step 2: OTP Verification
  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -right-4 w-72 h-72 bg-gradient-to-br from-emerald-200/40 to-teal-300/40 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-gradient-to-br from-teal-200/40 to-cyan-300/40 rounded-full blur-3xl"></div>
        </div>
        
        <Card className="w-full max-w-md shadow-2xl bg-white/95 backdrop-blur-sm border border-gray-200 rounded-3xl relative z-10">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Verify Your Email</CardTitle>
            <CardDescription className="text-gray-600">
              We've sent a 6-digit code to <strong>{formData.email}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otpData.otp}
                  onChange={handleOtpChange}
                  maxLength={6}
                  className={`text-center text-2xl tracking-widest ${validationErrors.otp ? 'border-red-500' : ''}`}
                  disabled={isLoading || isSubmitting}
                />
                {validationErrors.otp && (
                  <p className="text-sm text-red-600">{validationErrors.otp}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={isLoading || isSubmitting || !otpData.otp || otpData.otp.length !== 6}
              >
                {isSubmitting ? 'Verifying...' : 'Verify & Create Account'}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Didn't receive the code?
              </p>
              {otpData.canResend ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                >
                  Resend Code
                </Button>
              ) : (
                <p className="text-sm text-gray-500">
                  Resend available in {otpData.countdown}s
                </p>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStep(1)}
              className="w-full"
            >
              ← Back to registration
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 3: Success
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Account Created!</CardTitle>
          <CardDescription className="text-gray-600">
            Welcome to Roll & Charge! Your account has been successfully created and verified.
          </CardDescription>
          <p className="text-sm text-gray-500">
            Redirecting to dashboard...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;