import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import VehicleFormModal from './VehicleFormModal';
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Edit3,
  Trash2,
  Eye,
  Battery,
  MapPin,
  Calendar,
  Truck,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpDown,
  Download
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: { color: 'success', label: 'Active', icon: CheckCircle },
    charging: { color: 'primary', label: 'Charging', icon: Zap },
    maintenance: { color: 'warning', label: 'Maintenance', icon: AlertTriangle },
    offline: { color: 'error', label: 'Offline', icon: Clock },
    idle: { color: 'secondary', label: 'Idle', icon: Clock }
  };

  const config = statusConfig[status] || statusConfig.idle;
  const Icon = config.icon;

  const colorClasses = {
    success: 'bg-success-100 text-success-700 border-success-200',
    primary: 'bg-primary-100 text-primary-700 border-primary-200',
    warning: 'bg-warning-100 text-warning-700 border-warning-200',
    error: 'bg-error-100 text-error-700 border-error-200',
    secondary: 'bg-secondary-100 text-secondary-700 border-secondary-200'
  };

  return (
    <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClasses[config.color]}`}>
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </span>
  );
};

const VehicleCard = ({ vehicle, onEdit, onView, onDelete }) => {
  const getBatteryColor = (level) => {
    if (level > 60) return 'text-success-600';
    if (level > 30) return 'text-warning-600';
    return 'text-error-600';
  };

  const batteryLevel = vehicle.batteryInfo?.currentLevel || vehicle.currentBatteryLevel || 0;
  const mileage = vehicle.usage?.totalMiles || vehicle.maintenance?.mileage || vehicle.mileage || 0;
  const location = vehicle.location?.address || vehicle.currentLocation || 'Unknown';
  const displayName = `${vehicle.make} ${vehicle.model}`;

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-soft border border-white/20 hover:shadow-medium transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-soft">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-secondary-900">{displayName}</h3>
            <p className="text-sm text-secondary-500">{vehicle.year}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <StatusBadge status={vehicle.status} />
          <div className="relative group/menu">
            <button className="p-2 hover:bg-secondary-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="w-4 h-4 text-secondary-600" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 z-50">
              <button
                onClick={() => onView(vehicle)}
                className="w-full px-3 py-2 text-left hover:bg-secondary-50 flex items-center space-x-2 text-sm text-secondary-700"
              >
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
              <button
                onClick={() => onEdit(vehicle)}
                className="w-full px-3 py-2 text-left hover:bg-secondary-50 flex items-center space-x-2 text-sm text-secondary-700"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Vehicle</span>
              </button>
              <button
                onClick={() => onDelete(vehicle)}
                className="w-full px-3 py-2 text-left hover:bg-error-50 flex items-center space-x-2 text-sm text-error-700"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary-600">License Plate</span>
            <span className="text-sm font-medium text-secondary-900">{vehicle.licensePlate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary-600">Year</span>
            <span className="text-sm font-medium text-secondary-900">{vehicle.year}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Battery className={`w-4 h-4 ${getBatteryColor(batteryLevel)}`} />
              <span className="text-sm text-secondary-600">Battery</span>
            </div>
            <span className={`text-sm font-medium ${getBatteryColor(batteryLevel)}`}>
              {batteryLevel}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4 text-secondary-500" />
              <span className="text-sm text-secondary-600">Location</span>
            </div>
            <span className="text-sm font-medium text-secondary-900 truncate ml-2">{location}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-secondary-100">
        <div className="flex items-center space-x-1 text-xs text-secondary-500">
          <Calendar className="w-3 h-3" />
          <span>Added {vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString() : 'N/A'}</span>
        </div>
        <div className="text-xs text-secondary-500">
          Mileage: {mileage?.toLocaleString()} miles
        </div>
      </div>
    </div>
  );
};

const VehicleTable = ({ vehicles, onEdit, onView, onDelete }) => {
  const [sortField, setSortField] = useState('make');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedVehicles = [...vehicles].sort((a, b) => {
    let aValue, bValue;
    
    // Handle nested fields
    if (sortField === 'mileage') {
      aValue = a.usage?.totalMiles || a.maintenance?.mileage || a.mileage || 0;
      bValue = b.usage?.totalMiles || b.maintenance?.mileage || b.mileage || 0;
    } else {
      aValue = a[sortField];
      bValue = b[sortField];
    }
    
    const modifier = sortDirection === 'asc' ? 1 : -1;
    
    if (aValue < bValue) return -1 * modifier;
    if (aValue > bValue) return 1 * modifier;
    return 0;
  });

  const getBatteryColor = (level) => {
    if (level > 60) return 'text-success-600';
    if (level > 30) return 'text-warning-600';
    return 'text-error-600';
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-soft border border-white/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary-50/50">
            <tr>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('make')}
                  className="flex items-center space-x-1 text-sm font-medium text-secondary-900 hover:text-primary-600"
                >
                  <span>Vehicle</span>
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-secondary-900">Status</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-secondary-900">Battery</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-secondary-900">Location</th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('mileage')}
                  className="flex items-center space-x-1 text-sm font-medium text-secondary-900 hover:text-primary-600"
                >
                  <span>Mileage</span>
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-secondary-900">Last Updated</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-secondary-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100">
            {sortedVehicles.map((vehicle) => {
              const batteryLevel = vehicle.batteryInfo?.currentLevel || vehicle.currentBatteryLevel || 0;
              const mileage = vehicle.usage?.totalMiles || vehicle.maintenance?.mileage || vehicle.mileage || 0;
              const location = vehicle.location?.address || vehicle.currentLocation || 'Unknown';
              
              return (
                <tr key={vehicle.id || vehicle._id} className="hover:bg-secondary-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                        <Truck className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-secondary-900">{vehicle.make} {vehicle.model}</div>
                        <div className="text-sm text-secondary-500">{vehicle.year} • {vehicle.licensePlate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={vehicle.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Battery className={`w-4 h-4 ${getBatteryColor(batteryLevel)}`} />
                      <span className={`font-medium ${getBatteryColor(batteryLevel)}`}>
                        {batteryLevel}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1 text-secondary-900">
                      <MapPin className="w-4 h-4 text-secondary-500" />
                      <span className="truncate max-w-xs">{location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-secondary-900">
                    {mileage?.toLocaleString()} mi
                  </td>
                  <td className="px-6 py-4 text-sm text-secondary-500">
                    {vehicle.updatedAt ? new Date(vehicle.updatedAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onView(vehicle)}
                        className="p-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(vehicle)}
                        className="p-2 text-secondary-600 hover:text-fleet-600 hover:bg-fleet-50 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(vehicle)}
                        className="p-2 text-secondary-600 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ModernVehicles = () => {
  const { apiClient } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to fetch vehicles from the API
  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/vehicles', {
        params: {
          search: searchTerm,
          status: statusFilter === 'all' ? undefined : statusFilter,
        },
      });
      setVehicles(response.data.data);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      // You might want to set an error state here to show a message to the user
    } finally {
      setLoading(false);
    }
  }, [apiClient, searchTerm, statusFilter]);

  // Load vehicles on component mount and when filters change
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const filteredVehicles = vehicles;

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsFormOpen(true);
  };

  const handleView = (vehicle) => {
    console.log('View vehicle:', vehicle);
    // TODO: Implement view details modal
  };

  const handleDelete = async (vehicle) => {
    if (window.confirm(`Are you sure you want to delete ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})?`)) {
      try {
        await apiClient.delete(`/vehicles/${vehicle.id}`);
        fetchVehicles();
      } catch (error) {
        console.error('Failed to delete vehicle:', error);
        alert('Failed to delete vehicle. Please try again.');
      }
    }
  };

  const handleAddVehicle = () => {
    setSelectedVehicle(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (selectedVehicle) {
        // Update existing vehicle
        await apiClient.put(`/vehicles/${selectedVehicle.id}`, formData);
      } else {
        // Create new vehicle
        await apiClient.post('/vehicles', formData);
      }
      setIsFormOpen(false);
      setSelectedVehicle(null);
      fetchVehicles();
    } catch (error) {
      console.error('Failed to save vehicle:', error);
      alert(error.response?.data?.error || 'Failed to save vehicle. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedVehicle(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <span className="text-secondary-600 font-medium">Loading vehicles...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Fleet Vehicles</h1>
          <p className="text-secondary-600 mt-2">
            Manage and monitor your electric vehicle fleet
          </p>
        </div>
        <button
          onClick={handleAddVehicle}
          className="mt-4 sm:mt-0 inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-xl shadow-soft hover:shadow-medium hover:from-primary-700 hover:to-primary-800 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 pr-10 text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="charging">Charging</option>
              <option value="maintenance">Maintenance</option>
              <option value="offline">Offline</option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5 pointer-events-none" />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-white/70 backdrop-blur-sm rounded-xl p-1 border border-white/20">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-primary-600 text-white shadow-soft' 
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'table' 
                  ? 'bg-primary-600 text-white shadow-soft' 
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              <div className="w-4 h-4 flex flex-col space-y-1">
                <div className="h-0.5 bg-current rounded"></div>
                <div className="h-0.5 bg-current rounded"></div>
                <div className="h-0.5 bg-current rounded"></div>
              </div>
            </button>
          </div>

          {/* Export Button */}
          <button className="flex items-center space-x-2 px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl text-secondary-700 hover:text-secondary-900 hover:bg-white/80 transition-all duration-200">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-secondary-600">
          Showing {filteredVehicles.length} vehicle(s)
        </p>
      </div>

      {/* Vehicles Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVehicles.map(vehicle => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <VehicleTable
          vehicles={filteredVehicles}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
        />
      )}

      {filteredVehicles.length === 0 && (
        <div className="text-center py-12">
          <Truck className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No vehicles found</h3>
          <p className="text-secondary-600">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Vehicle Form Modal */}
      <VehicleFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        vehicle={selectedVehicle}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ModernVehicles;