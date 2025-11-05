import { ServiceRequestService } from '../services/serviceRequestService.js';
import { asyncHandler } from '../middleware/validation.js';

export class ServiceRequestController {
  // GET /api/v1/service-requests
  static getServiceRequests = asyncHandler(async (req, res) => {
    try {
      const serviceRequests = await ServiceRequestService.getAll(req.user);
      
      res.json({
        success: true,
        data: serviceRequests
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // GET /api/v1/service-requests/:id
  static getServiceRequestById = asyncHandler(async (req, res) => {
    try {
      const serviceRequest = await ServiceRequestService.getById(req.params.id, req.user);
      
      res.json({
        success: true,
        data: serviceRequest
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/v1/service-requests
  static createServiceRequest = asyncHandler(async (req, res) => {
    try {
      const serviceRequestData = {
        ...req.body,
        requestedBy: req.user.id,
        status: 'pending',
        requestDate: new Date(),
      };

      const serviceRequest = await ServiceRequestService.create(serviceRequestData);
      
      res.status(201).json({
        success: true,
        data: serviceRequest,
        message: 'Service request created successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/v1/service-requests/:id
  static updateServiceRequest = asyncHandler(async (req, res) => {
    try {
      const serviceRequest = await ServiceRequestService.update(req.params.id, req.body, req.user);
      
      res.json({
        success: true,
        data: serviceRequest,
        message: 'Service request updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/v1/service-requests/:id/assign
  static assignTechnician = asyncHandler(async (req, res) => {
    try {
      const { technicianId } = req.body;
      
      if (!technicianId) {
        return res.status(400).json({
          success: false,
          error: 'Technician ID is required'
        });
      }

      const serviceRequest = await ServiceRequestService.assignTechnician(req.params.id, technicianId, req.user);
      
      res.json({
        success: true,
        data: serviceRequest,
        message: 'Technician assigned successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  // DELETE /api/v1/service-requests/:id
  static deleteServiceRequest = asyncHandler(async (req, res) => {
    try {
      await ServiceRequestService.delete(req.params.id, req.user);
      
      res.json({
        success: true,
        message: 'Service request deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });
}

export default ServiceRequestController;