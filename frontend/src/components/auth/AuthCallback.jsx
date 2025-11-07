import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent } from '../ui/Card';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleOAuthCallback, isAuthenticated } = useAuth();

  useEffect(() => {
    // Handle the OAuth callback
    handleOAuthCallback(location.search);
  }, [location.search, handleOAuthCallback]);

  useEffect(() => {
    // Redirect once authenticated
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Handle error cases
    const urlParams = new URLSearchParams(location.search);
    const error = urlParams.get('error');
    
    if (error) {
      // Redirect to signin with error message after a short delay
      setTimeout(() => {
        navigate('/signin', { 
          state: { 
            error: 'Authentication failed. Please try again.' 
          }
        });
      }, 2000);
    }
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="pt-6 text-center space-y-4">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Completing sign in...
          </h2>
          <p className="text-gray-600">
            Please wait while we complete your authentication.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;