import db from '../database/index.js';

export class ServiceRequestService {
  // Get all service requests for a user
  static async getAll(user) {
    try {
      const serviceRequests = db.findAll('serviceRequests');
      
      // Filter based on user role
      if (user.role === 'admin' || user.role === 'fleet_manager') {
        return serviceRequests;
      } else if (user.role === 'technician') {
        // Technicians can see requests assigned to them or unassigned ones
        return serviceRequests.filter(req => 
          req.technicianId === user.id || req.status === 'waiting'
        );
      } else if (user.role === 'driver') {
        // Drivers can only see their own requests
        return serviceRequests.filter(req => req.requestedBy === user.email);
      }
      
      return [];
    } catch (error) {
      throw new Error(`Failed to retrieve service requests: ${error.message}`);
    }
  }

  // Get service request by ID
  static async getById(id, user) {
    try {
      const serviceRequest = db.findById('serviceRequests', id);
      
      if (!serviceRequest) {
        throw new Error('Service request not found');
      }

      // Check if user has permission to view this service request
      if (user.role === 'admin' || user.role === 'fleet_manager') {
        return serviceRequest;
      } else if (user.role === 'technician' && 
                (serviceRequest.technicianId === user.id || serviceRequest.status === 'waiting')) {
        return serviceRequest;
      } else if (user.role === 'driver' && serviceRequest.requestedBy === user.email) {
        return serviceRequest;
      }

      throw new Error('Access denied');
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Create new service request
  static async create(serviceRequestData) {
    try {
      // Validate vehicle exists
      const vehicle = db.findById('vehicles', serviceRequestData.vehicleId);
      if (!vehicle) {
        throw new Error('Vehicle not found');
      }

      const serviceRequest = db.create('serviceRequests', {
        ...serviceRequestData,
        fleetId: vehicle.fleetId,
        status: 'waiting',
        technicianId: null,
        assignedTechnicianName: null
      });

      return serviceRequest;
    } catch (error) {
      throw new Error(`Failed to create service request: ${error.message}`);
    }
  }

  // Update service request
  static async update(id, updateData, user) {
    try {
      const existingRequest = db.findById('serviceRequests', id);
      
      if (!existingRequest) {
        throw new Error('Service request not found');
      }

      // Check permissions
      if (user.role !== 'admin' && user.role !== 'fleet_manager' && 
          existingRequest.requestedBy !== user.email) {
        throw new Error('Access denied');
      }

      const updatedRequest = db.update('serviceRequests', id, updateData);
      return updatedRequest;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Assign technician to service request
  static async assignTechnician(id, technicianId, user) {
    try {
      if (user.role !== 'admin' && user.role !== 'fleet_manager') {
        throw new Error('Access denied');
      }

      const serviceRequest = db.findById('serviceRequests', id);
      if (!serviceRequest) {
        throw new Error('Service request not found');
      }

      const technician = db.findById('technicians', technicianId);
      if (!technician) {
        throw new Error('Technician not found');
      }

      const updatedRequest = db.update('serviceRequests', id, {
        technicianId: technicianId,
        assignedTechnicianName: technician.name,
        status: 'assigned',
        assignedDate: new Date().toISOString()
      });

      return updatedRequest;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Delete service request
  static async delete(id, user) {
    try {
      const serviceRequest = db.findById('serviceRequests', id);
      
      if (!serviceRequest) {
        throw new Error('Service request not found');
      }

      // Only admin, fleet manager, or the requester can delete
      if (user.role !== 'admin' && user.role !== 'fleet_manager' && 
          serviceRequest.requestedBy !== user.email) {
        throw new Error('Access denied');
      }

      const result = db.delete('serviceRequests', id);
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export default ServiceRequestService;