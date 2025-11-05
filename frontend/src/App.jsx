import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Vehicles from './components/Vehicles';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route
              path="vehicles"
              element={
                <ProtectedRoute roles={['admin', 'fleet_manager', 'driver']}>
                  <Vehicles />
                </ProtectedRoute>
              }
            />
            <Route
              path="service-requests"
              element={
                <ProtectedRoute roles={['admin', 'fleet_manager', 'technician']}>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900">Service Requests</h2>
                    <p className="text-gray-600 mt-2">Coming soon...</p>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="technicians"
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
              path="invoices"
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
              path="settings"
              element={
                <ProtectedRoute roles={['admin']}>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                    <p className="text-gray-600 mt-2">Coming soon...</p>
                  </div>
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
