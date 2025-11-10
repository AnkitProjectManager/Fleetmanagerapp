import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { Checkbox } from '../ui/Checkbox';
import { Alert, AlertDescription } from '../ui/Alert';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';
import RollChargeLogo from '../ui/RollChargeLogo';

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
    // Only depend on isAuthenticated and navigate - location causes infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      clearError();
      await login(formData.email, formData.password, formData.rememberMe);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 relative overflow-hidden">
      {/* Modern background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -right-4 w-72 h-72 bg-gradient-to-br from-emerald-200/40 to-teal-300/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-gradient-to-br from-teal-200/40 to-cyan-300/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-100/30 to-teal-100/30 rounded-full blur-3xl"></div>
      </div>
      
      <Card className="w-full max-w-sm mx-auto bg-white/95 backdrop-blur-sm border border-gray-200 shadow-2xl relative z-10 rounded-3xl overflow-hidden">
        <CardHeader className="space-y-8 text-center pb-8 pt-12">
          <div className="flex justify-center">
            <RollChargeLogo />
          </div>
          <div className="space-y-3 mt-6">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Welcome back
            </CardTitle>
            <p className="text-gray-600 text-lg font-medium">
              Sign in to Roll & Charge Fleet Management
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 px-8 pb-8">
          {/* Development Credentials Helper */}
          {process.env.NODE_ENV === 'development' && (
            <Alert className="border-emerald-200 bg-emerald-50 rounded-2xl shadow-sm">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              <AlertDescription className="text-emerald-800">
                <div className="font-semibold mb-1">Test Credentials</div>
                <div className="text-sm space-y-1">
                  <div><strong>Email:</strong> admin@rollcharge.com</div>
                  <div><strong>Password:</strong> admin123</div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="border-red-300 bg-red-50 rounded-2xl shadow-sm">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="text-red-800 font-medium">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-800 tracking-wide">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`pl-12 pr-4 h-14 rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-sm text-gray-800 placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300 text-base font-medium shadow-sm ${validationErrors.email ? 'ring-2 ring-red-400/50 bg-red-50 border-red-300' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {validationErrors.email && (
                <p className="text-sm text-red-600 flex items-center mt-2">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {validationErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-800 tracking-wide">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`pl-12 pr-12 h-14 rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-sm text-gray-800 placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300 text-base font-medium shadow-sm ${validationErrors.password ? 'ring-2 ring-red-400/50 bg-red-50 border-red-300' : ''}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-sm text-red-600 flex items-center mt-2">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {validationErrors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(e) => 
                    setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))
                  }
                  disabled={isLoading}
                  className="border-gray-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 rounded-md"
                />
                <Label 
                  htmlFor="rememberMe" 
                  className="text-sm font-medium text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me for 7 days
                </Label>
              </div>

              <Link 
                to="/forgot-password" 
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="pt-8 pb-8">
          <p className="text-center text-base text-gray-600 w-full">
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors ml-1"
            >
              Create account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignIn;