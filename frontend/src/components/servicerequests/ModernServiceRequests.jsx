import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Edit3,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  MapPin,
  Wrench,
  ArrowUpDown,
  Download,
  MessageSquare,
  FileText
} from 'lucide-react';

const PriorityBadge = ({ priority }) => {
  const priorityConfig = {
    low: { color: 'success', label: 'Low', bg: 'bg-success-100', text: 'text-success-700', border: 'border-success-200' },
    medium: { color: 'warning', label: 'Medium', bg: 'bg-warning-100', text: 'text-warning-700', border: 'border-warning-200' },
    high: { color: 'error', label: 'High', bg: 'bg-error-100', text: 'text-error-700', border: 'border-error-200' },
    urgent: { color: 'error', label: 'Urgent', bg: 'bg-error-100', text: 'text-error-700', border: 'border-error-200' }
  };

  const config = priorityConfig[priority] || priorityConfig.medium;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      {config.label}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: 'warning', label: 'Pending', icon: Clock },
    'in-progress': { color: 'primary', label: 'In Progress', icon: Wrench },
    completed: { color: 'success', label: 'Completed', icon: CheckCircle },
    cancelled: { color: 'error', label: 'Cancelled', icon: XCircle }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  const colorClasses = {
    success: 'bg-success-100 text-success-700 border-success-200',
    primary: 'bg-primary-100 text-primary-700 border-primary-200',
    warning: 'bg-warning-100 text-warning-700 border-warning-200',
    error: 'bg-error-100 text-error-700 border-error-200'
  };

  return (
    <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClasses[config.color]}`}>
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </span>
  );
};

const ServiceRequestCard = ({ request, onEdit, onView, onDelete }) => {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-soft border border-white/20 hover:shadow-medium transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-fleet-500 to-fleet-600 rounded-xl flex items-center justify-center shadow-soft">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-secondary-900">{request.title}</h3>
            <p className="text-sm text-secondary-500">#{request.id.toString().padStart(6, '0')}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <StatusBadge status={request.status} />
          <div className="relative group/menu">
            <button className="p-2 hover:bg-secondary-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="w-4 h-4 text-secondary-600" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 z-50">
              <button
                onClick={() => onView(request)}
                className="w-full px-3 py-2 text-left hover:bg-secondary-50 flex items-center space-x-2 text-sm text-secondary-700"
              >
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
              <button
                onClick={() => onEdit(request)}
                className="w-full px-3 py-2 text-left hover:bg-secondary-50 flex items-center space-x-2 text-sm text-secondary-700"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Request</span>
              </button>
              <button
                onClick={() => onDelete(request)}
                className="w-full px-3 py-2 text-left hover:bg-error-50 flex items-center space-x-2 text-sm text-error-700"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-secondary-600">Vehicle</span>
          <span className="text-sm font-medium text-secondary-900">{request.vehicle}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-secondary-600">Priority</span>
          <PriorityBadge priority={request.priority} />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <User className="w-4 h-4 text-secondary-500" />
            <span className="text-sm text-secondary-600">Assigned</span>
          </div>
          <span className="text-sm font-medium text-secondary-900">
            {request.assignedTo || 'Unassigned'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4 text-secondary-500" />
            <span className="text-sm text-secondary-600">Due Date</span>
          </div>
          <span className="text-sm text-secondary-900">
            {new Date(request.dueDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="border-t border-secondary-100 pt-4">
        <p className="text-sm text-secondary-600 line-clamp-2">{request.description}</p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-secondary-100 mt-4">
        <div className="flex items-center space-x-1 text-xs text-secondary-500">
          <Calendar className="w-3 h-3" />
          <span>Created {new Date(request.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-2">
          {request.commentsCount > 0 && (
            <div className="flex items-center space-x-1 text-xs text-secondary-500">
              <MessageSquare className="w-3 h-3" />
              <span>{request.commentsCount}</span>
            </div>
          )}
          {request.attachmentsCount > 0 && (
            <div className="flex items-center space-x-1 text-xs text-secondary-500">
              <FileText className="w-3 h-3" />
              <span>{request.attachmentsCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ServiceRequestTable = ({ requests, onEdit, onView, onDelete }) => {
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedRequests = [...requests].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const modifier = sortDirection === 'asc' ? 1 : -1;
    
    if (aValue < bValue) return -1 * modifier;
    if (aValue > bValue) return 1 * modifier;
    return 0;
  });

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-soft border border-white/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary-50/50">
            <tr>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('id')}
                  className="flex items-center space-x-1 text-sm font-medium text-secondary-900 hover:text-primary-600"
                >
                  <span>Request ID</span>
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center space-x-1 text-sm font-medium text-secondary-900 hover:text-primary-600"
                >
                  <span>Title</span>
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-secondary-900">Vehicle</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-secondary-900">Status</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-secondary-900">Priority</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-secondary-900">Assigned To</th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('dueDate')}
                  className="flex items-center space-x-1 text-sm font-medium text-secondary-900 hover:text-primary-600"
                >
                  <span>Due Date</span>
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium text-secondary-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100">
            {sortedRequests.map((request) => (
              <tr key={request.id} className="hover:bg-secondary-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-fleet-500 to-fleet-600 rounded-lg flex items-center justify-center">
                      <Wrench className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-mono text-sm text-secondary-900">
                      #{request.id.toString().padStart(6, '0')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-secondary-900">{request.title}</div>
                    <div className="text-sm text-secondary-500 truncate max-w-xs">{request.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-secondary-900">{request.vehicle}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={request.status} />
                </td>
                <td className="px-6 py-4">
                  <PriorityBadge priority={request.priority} />
                </td>
                <td className="px-6 py-4 text-secondary-900">
                  {request.assignedTo || (
                    <span className="text-secondary-500 italic">Unassigned</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-secondary-900">
                  {new Date(request.dueDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onView(request)}
                      className="p-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(request)}
                      className="p-2 text-secondary-600 hover:text-fleet-600 hover:bg-fleet-50 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(request)}
                      className="p-2 text-secondary-600 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ModernServiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  // Mock data - replace with actual API calls
  useEffect(() => {
    const loadServiceRequests = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockRequests = [
        {
          id: 1,
          title: 'Brake Inspection Required',
          description: 'Regular brake inspection and maintenance for safety compliance',
          vehicle: 'EV-001 Tesla Model Y',
          status: 'pending',
          priority: 'high',
          assignedTo: 'John Smith',
          dueDate: '2024-01-25',
          createdAt: '2024-01-20',
          commentsCount: 2,
          attachmentsCount: 1
        },
        {
          id: 2,
          title: 'Battery Health Check',
          description: 'Comprehensive battery diagnostic and health assessment',
          vehicle: 'EV-002 Ford E-Transit',
          status: 'in-progress',
          priority: 'medium',
          assignedTo: 'Sarah Johnson',
          dueDate: '2024-01-22',
          createdAt: '2024-01-18',
          commentsCount: 5,
          attachmentsCount: 3
        },
        {
          id: 3,
          title: 'Charging Port Malfunction',
          description: 'Vehicle unable to charge properly, port inspection needed',
          vehicle: 'EV-003 Nissan Leaf',
          status: 'completed',
          priority: 'urgent',
          assignedTo: 'Mike Davis',
          dueDate: '2024-01-20',
          createdAt: '2024-01-15',
          commentsCount: 8,
          attachmentsCount: 2
        },
        {
          id: 4,
          title: 'Tire Rotation Service',
          description: 'Scheduled tire rotation and alignment check',
          vehicle: 'EV-004 Rivian R1T',
          status: 'pending',
          priority: 'low',
          assignedTo: null,
          dueDate: '2024-01-30',
          createdAt: '2024-01-19',
          commentsCount: 0,
          attachmentsCount: 0
        },
        {
          id: 5,
          title: 'HVAC System Repair',
          description: 'Climate control system not functioning properly',
          vehicle: 'EV-005 Mercedes EQV',
          status: 'cancelled',
          priority: 'medium',
          assignedTo: 'Lisa Wilson',
          dueDate: '2024-01-24',
          createdAt: '2024-01-17',
          commentsCount: 3,
          attachmentsCount: 1
        }
      ];
      
      setRequests(mockRequests);
      setLoading(false);
    };

    loadServiceRequests();
  }, []);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleEdit = (request) => {
    console.log('Edit request:', request);
    // Implement edit functionality
  };

  const handleView = (request) => {
    console.log('View request:', request);
    // Implement view functionality
  };

  const handleDelete = (request) => {
    console.log('Delete request:', request);
    // Implement delete functionality
  };

  const handleCreateRequest = () => {
    console.log('Create new service request');
    // Implement create functionality
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <span className="text-secondary-600 font-medium">Loading service requests...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Service Requests</h1>
          <p className="text-secondary-600 mt-2">
            Manage fleet maintenance and service requests
          </p>
        </div>
        <button
          onClick={handleCreateRequest}
          className="mt-4 sm:mt-0 inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-fleet-600 to-fleet-700 text-white font-medium rounded-xl shadow-soft hover:shadow-medium hover:from-fleet-700 hover:to-fleet-800 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          <span>Create Request</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search service requests..."
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
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5 pointer-events-none" />
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="appearance-none bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 pr-10 text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <AlertTriangle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5 pointer-events-none" />
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
          Showing {filteredRequests.length} of {requests.length} service requests
        </p>
      </div>

      {/* Service Requests Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRequests.map(request => (
            <ServiceRequestCard
              key={request.id}
              request={request}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <ServiceRequestTable
          requests={filteredRequests}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
        />
      )}

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No service requests found</h3>
          <p className="text-secondary-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default ModernServiceRequests;