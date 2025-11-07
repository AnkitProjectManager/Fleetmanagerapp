import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Truck,
  Zap,
  Wrench,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Battery,
  Gauge,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';

const StatsCard = ({ title, value, change, changeType, icon: Icon, color = 'primary' }) => {
  const colorClasses = {
    primary: 'from-emerald-500 to-emerald-600',
    success: 'from-green-500 to-green-600', 
    warning: 'from-amber-500 to-amber-600',
    error: 'from-red-500 to-red-600',
    fleet: 'from-emerald-500 to-emerald-600'
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-white/20 hover:shadow-medium transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-secondary-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-secondary-900 mb-2">{value}</p>
          <div className="flex items-center space-x-1">
            {changeType === 'positive' ? (
              <ArrowUpRight className="w-4 h-4 text-success-600" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-error-600" />
            )}
            <span className={`text-sm font-medium ${
              changeType === 'positive' ? 'text-success-600' : 'text-error-600'
            }`}>
              {change}
            </span>
            <span className="text-sm text-secondary-500">vs last month</span>
          </div>
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const ActivityCard = ({ activity }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'maintenance': return <Wrench className="w-4 h-4" />;
      case 'delivery': return <Truck className="w-4 h-4" />;
      case 'charging': return <Zap className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'maintenance': return 'text-warning-600 bg-warning-100';
      case 'delivery': return 'text-emerald-600 bg-emerald-100';
      case 'charging': return 'text-success-600 bg-success-100';
      default: return 'text-secondary-600 bg-secondary-100';
    }
  };

  return (
    <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-secondary-50/50 transition-colors">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getColor(activity.type)}`}>
        {getIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-secondary-900 truncate">
          {activity.title}
        </p>
        <p className="text-xs text-secondary-500">
          {activity.vehicle} • {activity.time}
        </p>
      </div>
    </div>
  );
};

const VehicleStatusCard = ({ vehicle }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success-700 bg-success-100';
      case 'charging': return 'text-emerald-700 bg-emerald-100';
      case 'maintenance': return 'text-warning-700 bg-warning-100';
      case 'offline': return 'text-error-700 bg-error-100';
      default: return 'text-secondary-700 bg-secondary-100';
    }
  };

  const getBatteryColor = (level) => {
    if (level > 60) return 'text-success-600';
    if (level > 30) return 'text-warning-600';
    return 'text-error-600';
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-soft border border-white/20 hover:shadow-medium transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-semibold text-secondary-900">{vehicle.name}</h4>
          <p className="text-sm text-secondary-500">{vehicle.plate}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(vehicle.status)}`}>
          {vehicle.status}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Battery className={`w-4 h-4 ${getBatteryColor(vehicle.battery)}`} />
            <span className="text-sm text-secondary-600">Battery</span>
          </div>
          <span className={`text-sm font-medium ${getBatteryColor(vehicle.battery)}`}>
            {vehicle.battery}%
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-secondary-500" />
            <span className="text-sm text-secondary-600">Location</span>
          </div>
          <span className="text-sm text-secondary-900">{vehicle.location}</span>
        </div>
      </div>
    </div>
  );
};

const ModernDashboard = () => {
  const { user, apiClient } = useAuth();
  const [fleetData, setFleetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real data from API
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch vehicles data
        const vehiclesResponse = await apiClient.get('/vehicles');
        const vehicles = vehiclesResponse.data.data || [];

        // Fetch service requests
        const serviceRequestsResponse = await apiClient.get('/service-requests');
        const serviceRequests = serviceRequestsResponse.data.data || [];

        // Calculate stats
        const totalVehicles = vehicles.length;
        const activeVehicles = vehicles.filter(v => v.status === 'active').length;
        const maintenanceRequests = serviceRequests.filter(
          sr => sr.status === 'pending' || sr.status === 'in_progress'
        ).length;

        // Format recent activity from service requests
        const recentActivity = serviceRequests
          .slice(0, 3)
          .map(sr => ({
            id: sr._id || sr.id,
            type: sr.priority === 'urgent' ? 'maintenance' : 'delivery',
            title: sr.description || sr.serviceType || 'Service Request',
            vehicle: sr.vehicleId?.vin || 'Unknown Vehicle',
            time: formatTimeAgo(sr.createdAt || sr.requestDate)
          }));

        // Format vehicles for display
        const formattedVehicles = vehicles.slice(0, 3).map(v => ({
          id: v._id || v.id,
          name: v.vin || `EV-${v.licensePlate}`,
          plate: v.licensePlate || 'N/A',
          status: v.status || 'active',
          battery: v.batteryInfo?.currentLevel || v.currentBatteryLevel || 0,
          location: v.location?.address || v.currentLocation || 'Unknown'
        }));

        setFleetData({
          stats: {
            totalVehicles,
            activeVehicles,
            maintenanceRequests,
            totalRevenue: '$42,350' // This would come from invoices API
          },
          recentActivity: recentActivity.length > 0 ? recentActivity : getDefaultActivity(),
          vehicles: formattedVehicles.length > 0 ? formattedVehicles : getDefaultVehicles()
        });
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err.message);
        // Set default data on error
        setFleetData({
          stats: {
            totalVehicles: 0,
            activeVehicles: 0,
            maintenanceRequests: 0,
            totalRevenue: '$0'
          },
          recentActivity: getDefaultActivity(),
          vehicles: getDefaultVehicles()
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [apiClient]);

  // Helper function to format time ago
  const formatTimeAgo = (date) => {
    if (!date) return 'Recently';
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Default activity when no data
  const getDefaultActivity = () => [
    {
      id: 1,
      type: 'charging',
      title: 'No recent activity',
      vehicle: 'Add vehicles to see activity',
      time: 'Just now'
    }
  ];

  // Default vehicles when no data
  const getDefaultVehicles = () => [
    {
      id: 1,
      name: 'No vehicles',
      plate: 'N/A',
      status: 'offline',
      battery: 0,
      location: 'Add vehicles to get started'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <span className="text-secondary-600 font-medium">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Dashboard</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!fleetData) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            Good morning, {user?.firstName}! 👋
          </h1>
          <p className="text-secondary-600 mt-2">
            Here's what's happening with your fleet today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-secondary-600">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Vehicles"
          value={fleetData.stats.totalVehicles}
          change="+2.5%"
          changeType="positive"
          icon={Truck}
          color="primary"
        />
        <StatsCard
          title="Active Vehicles"
          value={fleetData.stats.activeVehicles}
          change="+8.1%"
          changeType="positive"
          icon={CheckCircle}
          color="success"
        />
        <StatsCard
          title="Maintenance"
          value={fleetData.stats.maintenanceRequests}
          change="-12%"
          changeType="positive"
          icon={Wrench}
          color="warning"
        />
        <StatsCard
          title="Revenue"
          value={fleetData.stats.totalRevenue}
          change="+15.3%"
          changeType="positive"
          icon={DollarSign}
          color="fleet"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Fleet Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart placeholder */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-secondary-900">Fleet Performance</h3>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-lg">
                  7 Days
                </button>
                <button className="px-3 py-1 text-sm font-medium text-secondary-600 hover:text-secondary-900">
                  30 Days
                </button>
              </div>
            </div>
            
            {/* Placeholder for chart */}
            <div className="h-64 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl flex items-center justify-center border border-emerald-100/50">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-secondary-600 font-medium">Performance Chart</p>
                <p className="text-sm text-secondary-500">Integration with charting library needed</p>
              </div>
            </div>
          </div>

          {/* Recent Vehicles */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-white/20">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Vehicle Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fleetData.vehicles.map(vehicle => (
                <VehicleStatusCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary-900">Recent Activity</h3>
              <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                View All
              </button>
            </div>
            <div className="space-y-1">
              {fleetData.recentActivity.map(activity => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-white/20">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 text-left bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors group">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <Truck className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-secondary-900">Add Vehicle</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>

              <button className="w-full flex items-center justify-between p-3 text-left bg-success-50 hover:bg-success-100 rounded-xl transition-colors group">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-success-600 rounded-lg flex items-center justify-center">
                    <Wrench className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-secondary-900">Schedule Service</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-success-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>

              <button className="w-full flex items-center justify-between p-3 text-left bg-fleet-50 hover:bg-fleet-100 rounded-xl transition-colors group">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-fleet-600 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-secondary-900">Manage Team</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-fleet-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard;