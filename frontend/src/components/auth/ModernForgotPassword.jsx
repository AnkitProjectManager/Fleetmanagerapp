import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  Lock,
  Shield,
  Clock
} from 'lucide-react';

const ModernForgotPassword = () => {
  const [step, setStep] = useState('email'); // 'email' | 'sent' | 'success'
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setStep('sent');
      } else {
        setError(result.message || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'sent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-fleet-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">Check your email</h2>
            <p className="text-secondary-600 mb-6">
              We've sent a password reset link to{' '}
              <span className="font-medium text-secondary-900">{email}</span>
            </p>
            
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-900">Link expires in 15 minutes</span>
              </div>
              <p className="text-sm text-primary-700">
                Don't see the email? Check your spam folder or try a different email address.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => window.open('https://mail.google.com', '_blank')}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-xl shadow-soft hover:shadow-medium hover:from-primary-700 hover:to-primary-800 transition-all duration-300"
              >
                Open Email App
              </button>
              
              <button
                onClick={() => handleSubmit({ preventDefault: () => {} })}
                className="w-full px-6 py-3 bg-white/70 border border-white/20 text-secondary-700 font-medium rounded-xl hover:bg-white/80 transition-all duration-300"
              >
                Resend Email
              </button>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/signin"
                className="inline-flex items-center space-x-1 text-sm text-secondary-600 hover:text-secondary-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Sign In</span>
              </Link>
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
                className="w-32 h-auto" 
              />
            </div>
            <h2 className="text-3xl font-bold text-secondary-900 mb-2">Forgot your password?</h2>
            <p className="text-secondary-600">
              No worries! Enter your email and we'll send you reset instructions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 bg-secondary-50 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 placeholder-secondary-400"
                  placeholder="Enter your email address"
                  autoComplete="email"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-4 bg-error-50 border border-error-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0" />
                <span className="text-sm text-error-700">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full group relative px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-xl shadow-soft hover:shadow-medium hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="text-center">
            <Link
              to="/signin"
              className="inline-flex items-center space-x-1 text-sm font-medium text-secondary-600 hover:text-secondary-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>

          <div className="text-center">
            <p className="text-sm text-secondary-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Sign up here
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
            <Shield className="w-16 h-16 mx-auto mb-6 animate-pulse" />
            <h1 className="text-4xl font-bold mb-4">
              Secure Password Recovery
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              We take security seriously. Our password reset process is encrypted and expires quickly to keep your account safe.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 max-w-sm">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-white/90">Encrypted email delivery</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-white/90">15-minute expiry for security</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-white/90">Instant password reset</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernForgotPassword;