import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { vehicleAPI, serviceRequestAPI, technicianAPI } from '../services/api';
import { Car, Wrench, FileText, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeServiceRequests: 0,
    totalTechnicians: 0,
    pendingRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [vehiclesRes, serviceReqRes, techniciansRes] = await Promise.all([
        vehicleAPI.getAll(),
        serviceRequestAPI.getAll(),
        technicianAPI.getAll(),
      ]);

      const vehicles = vehiclesRes.data;
      const serviceRequests = serviceReqRes.data;
      const technicians = techniciansRes.data;

      setStats({
        totalVehicles: vehicles.length,
        activeServiceRequests: serviceRequests.filter(req => req.status !== 'completed').length,
        totalTechnicians: technicians.length,
        pendingRequests: serviceRequests.filter(req => req.status === 'pending').length,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg bg-${color}-100`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {user?.firstName}. Here's what's happening with your fleet.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Vehicles"
          value={stats.totalVehicles}
          icon={Car}
          color="blue"
        />
        <StatCard
          title="Active Service Requests"
          value={stats.activeServiceRequests}
          icon={FileText}
          color="green"
        />
        <StatCard
          title="Available Technicians"
          value={stats.totalTechnicians}
          icon={Wrench}
          color="purple"
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon={AlertCircle}
          color="yellow"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Service Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              Service requests data will be displayed here once the backend service requests controller is implemented.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fleet Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              Fleet status overview will be displayed here with vehicle health metrics.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;