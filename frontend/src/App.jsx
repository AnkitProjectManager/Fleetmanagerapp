import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import AuthCallback from './components/auth/AuthCallback';
import Dashboard from './components/Dashboard';
import Vehicles from './components/Vehicles';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes (authentication) */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/login" element={<Navigate to="/signin" replace />} />

          {/* Protected application routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route
                      path="/vehicles"
                      element={
                        <ProtectedRoute roles={['admin', 'fleet_manager', 'driver']}>
                          <Vehicles />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/service-requests"
                      element={
                        <ProtectedRoute roles={['admin', 'fleet_manager', 'technician']}>
                          <div className="space-y-6">
                            <div>
                              <h1 className="text-3xl font-bold text-gray-900">Service Requests</h1>
                              <p className="mt-2 text-gray-600">Manage fleet service requests and maintenance</p>
                            </div>
                            <div className="text-center py-12 bg-white rounded-lg shadow">
                              <h3 className="text-lg font-medium text-gray-900 mb-2">Service Requests Module</h3>
                              <p className="text-gray-600">Modern service request management interface coming soon...</p>
                            </div>
                          </div>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/technicians"
                      element={
                        <ProtectedRoute roles={['admin', 'fleet_manager']}>
                          <div className="text-center py-12">
                            <h2 className="text-2xl font-bold text-gray-900">Technicians</h2>
                            <p className="text-gray-600 mt-2">Coming soon...</p>
                          </div>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/invoices"
                      element={
                        <ProtectedRoute roles={['admin', 'fleet_manager']}>
                          <div className="text-center py-12">
                            <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
                            <p className="text-gray-600 mt-2">Coming soon...</p>
                          </div>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute roles={['admin']}>
                          <div className="text-center py-12">
                            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                            <p className="text-gray-600 mt-2">Coming soon...</p>
                          </div>
                        </ProtectedRoute>
                      }
                    />
                    {/* Root redirect inside protected routes */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
