import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  AlertCircle,
  Chrome,
  Shield,
  Sparkles
} from 'lucide-react';

const ModernSignUp = () => {
  const navigate = useNavigate();
  const { signup, signupWithGoogle } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'driver',
    acceptTerms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('details'); // 'details' | 'otp' | 'complete'
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const passwordRequirements = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
    { label: 'Contains number', met: /\d/.test(formData.password) },
    { label: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) }
  ];

  const isPasswordValid = passwordRequirements.every(req => req.met);
  const passwordsMatch = formData.password && formData.password === formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      setError('Please ensure your password meets all requirements');
      return;
    }
    
    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }
    
    if (!formData.acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signup(formData);
      if (result.success) {
        setStep('otp');
      } else {
        setError(result.message || 'Signup failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    setOtpLoading(true);
    setError('');

    try {
      // Call verify OTP API
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setStep('complete');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(result.message || 'Invalid verification code');
      }
    } catch (err) {
      setError('Failed to verify code. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      await signupWithGoogle();
    } catch (err) {
      setError('Google signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  if (step === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-fleet-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">Welcome to Roll & Charge Fleet Management! 🎉</h2>
            <p className="text-secondary-600 mb-6">
              Your account has been created successfully. You're being redirected to your dashboard.
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'otp') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-fleet-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-secondary-900 mb-2">Check your email</h2>
              <p className="text-secondary-600">
                We've sent a 6-digit verification code to{' '}
                <span className="font-medium text-secondary-900">{formData.email}</span>
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-secondary-700 mb-2">
                  Verification Code
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="000000"
                  className="w-full px-4 py-4 bg-white/50 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                  autoComplete="one-time-code"
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 p-3 bg-error-50 border border-error-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0" />
                  <span className="text-sm text-error-700">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={otpLoading || otp.length !== 6}
                className="w-full group relative px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-xl shadow-soft hover:shadow-medium hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center">
                  {otpLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Account
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-secondary-600">
                Didn't receive the code?{' '}
                <button 
                  onClick={() => {/* Implement resend OTP */}}
                  className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Resend
                </button>
              </p>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => setStep('details')}
                className="text-sm text-secondary-600 hover:text-secondary-900 transition-colors"
              >
                ← Back to signup
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img 
                src="/src/assets/ev-repair-logo.923ecc755fed70eb61ca (1).png" 
                alt="Roll & Charge Fleet Management" 
                className="w-40 h-auto" 
              />
            </div>
            <h2 className="text-3xl font-bold text-secondary-900 mb-2">Create your account</h2>
            <p className="text-secondary-600">Join the future of EV repair & tires</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-secondary-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="John"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-secondary-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="john@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-secondary-700 mb-2">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              >
                <option value="driver">Driver</option>
                <option value="fleet_manager">Fleet Manager</option>
                <option value="technician">Technician</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            {formData.password && (
              <div className="bg-secondary-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-secondary-700 mb-2">Password requirements:</h4>
                <div className="space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        req.met ? 'bg-success-100' : 'bg-secondary-200'
                      }`}>
                        {req.met && <Check className="w-3 h-3 text-success-600" />}
                      </div>
                      <span className={`text-sm ${req.met ? 'text-success-700' : 'text-secondary-600'}`}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Password Match Indicator */}
            {formData.confirmPassword && (
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  passwordsMatch ? 'bg-success-100' : 'bg-error-100'
                }`}>
                  {passwordsMatch ? (
                    <Check className="w-3 h-3 text-success-600" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-error-600" />
                  )}
                </div>
                <span className={`text-sm ${passwordsMatch ? 'text-success-700' : 'text-error-700'}`}>
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </span>
              </div>
            )}

            <div className="flex items-center">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <label htmlFor="acceptTerms" className="ml-2 text-sm text-secondary-600">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-error-50 border border-error-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0" />
                <span className="text-sm text-error-700">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isPasswordValid || !passwordsMatch || !formData.acceptTerms}
              className="w-full group relative px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-xl shadow-soft hover:shadow-medium hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-secondary-500">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 border border-secondary-300 rounded-xl text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Chrome className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-secondary-600">
              Already have an account?{' '}
              <Link
                to="/signin"
                className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Hero */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary-600 via-primary-700 to-fleet-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-40 left-20 w-24 h-24 bg-white/5 rounded-full animate-pulse delay-300"></div>
          <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-700"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-12 text-white">
          <div className="mb-8">
            <Sparkles className="w-16 h-16 mx-auto mb-6 animate-pulse" />
            <h1 className="text-4xl font-bold mb-4">
              Join Roll & Charge Fleet Management Today
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Experience the future of electric vehicle fleet management with intelligent automation and real-time insights.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 max-w-sm">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-white/90">Real-time vehicle tracking</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-white/90">Automated maintenance scheduling</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-white/90">Advanced analytics dashboard</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernSignUp;