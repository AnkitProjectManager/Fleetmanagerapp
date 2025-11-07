import { Vehicle } from '../models/index.js';
import { asyncHandler } from '../middleware/validation.js';

export class VehicleController {
  // GET /api/v1/vehicles
  static getVehicles = asyncHandler(async (req, res) => {
    const { fleetId, status, search } = req.query;
    let filter = {};
    
    // If user is not admin, filter by their fleet
    if (req.user.role !== 'admin') {
      filter.fleetId = req.user.fleetId;
    } else if (fleetId) {
      filter.fleetId = parseInt(fleetId);
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (search) {
      // For in-memory database, we'll implement a simple search
      const vehicles = await Vehicle.findAll(filter);
      const searchResults = vehicles.filter(vehicle => 
        vehicle.make.toLowerCase().includes(search.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(search.toLowerCase()) ||
        vehicle.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
        vehicle.vin.toLowerCase().includes(search.toLowerCase())
      );
      
      return res.json({
        success: true,
        data: searchResults,
        count: searchResults.length
      });
    }
    
    try {
      const vehicles = await Vehicle.findAll(filter);
      
      res.json({
        success: true,
        data: vehicles,
        count: vehicles.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vehicles'
      });
    }
  });

  // GET /api/v1/vehicles/:id
  static getVehicle = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    try {
      const vehicle = await Vehicle.findById(id);
      
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          error: 'Vehicle not found'
        });
      }
      
      // Check if user has access to this vehicle
      if (req.user.role !== 'admin' && vehicle.fleetId !== req.user.fleetId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this vehicle'
        });
      }
      
      res.json({
        success: true,
        data: vehicle
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vehicle'
      });
    }
  });

  // POST /api/v1/vehicles
  static createVehicle = asyncHandler(async (req, res) => {
    const vehicleData = req.body;
    
    // Set fleet ID based on user's fleet (unless admin specifies otherwise)
    if (req.user.role !== 'admin') {
      vehicleData.fleetId = req.user.fleetId;
    }
    
    try {
      // Check if VIN already exists
      const existingVehicle = await Vehicle.findByVin(vehicleData.vin);
      if (existingVehicle) {
        return res.status(400).json({
          success: false,
          error: 'Vehicle with this VIN already exists'
        });
      }
      
      const vehicle = await Vehicle.create({
        ...vehicleData,
        status: vehicleData.status || 'active'
      });
      
      res.status(201).json({
        success: true,
        data: vehicle,
        message: 'Vehicle created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create vehicle'
      });
    }
  });

  // PUT /api/v1/vehicles/:id
  static updateVehicle = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    
    try {
      const existingVehicle = await Vehicle.findById(id);
      
      if (!existingVehicle) {
        return res.status(404).json({
          success: false,
          error: 'Vehicle not found'
        });
      }
      
      // Check if user has access to this vehicle
      if (req.user.role !== 'admin' && existingVehicle.fleetId !== req.user.fleetId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this vehicle'
        });
      }
      
      // If VIN is being updated, check for duplicates
      if (updateData.vin && updateData.vin !== existingVehicle.vin) {
        const vinExists = await Vehicle.findByVin(updateData.vin);
        if (vinExists) {
          return res.status(400).json({
            success: false,
            error: 'Vehicle with this VIN already exists'
          });
        }
      }
      
      const vehicle = await Vehicle.update(id, updateData);
      
      res.json({
        success: true,
        data: vehicle,
        message: 'Vehicle updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update vehicle'
      });
    }
  });

  // DELETE /api/v1/vehicles/:id
  static deleteVehicle = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    try {
      const vehicle = await Vehicle.findById(id);
      
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          error: 'Vehicle not found'
        });
      }
      
      // Check if user has access to this vehicle
      if (req.user.role !== 'admin' && vehicle.fleetId !== req.user.fleetId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this vehicle'
        });
      }
      
      const deleted = await Vehicle.delete(id);
      
      if (!deleted) {
        return res.status(500).json({
          success: false,
          error: 'Failed to delete vehicle'
        });
      }
      
      res.json({
        success: true,
        message: 'Vehicle deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete vehicle'
      });
    }
  });

  // GET /api/v1/vehicles/:id/service-history
  static getServiceHistory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    try {
      const vehicle = await Vehicle.findById(id);
      
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          error: 'Vehicle not found'
        });
      }
      
      // Check if user has access to this vehicle
      if (req.user.role !== 'admin' && vehicle.fleetId !== req.user.fleetId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this vehicle'
        });
      }
      
      // Import ServiceRequest here to avoid circular dependency
      const { ServiceRequest } = await import('../models/index.js');
      const serviceHistory = await ServiceRequest.findByVehicleId(parseInt(id));
      
      res.json({
        success: true,
        data: serviceHistory
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch service history'
      });
    }
  });
}

export default VehicleController;