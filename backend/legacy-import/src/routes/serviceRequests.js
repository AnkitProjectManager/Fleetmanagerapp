import express from 'express';
import { body } from 'express-validator';
import { ServiceRequestController } from '../controllers/serviceRequestController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Validation rules for service requests
const createValidation = [
  body('vehicleId').notEmpty().withMessage('Vehicle ID is required'),
  body('serviceType').notEmpty().withMessage('Service type is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  validateRequest
];

const updateValidation = [
  body('serviceType').optional().notEmpty().withMessage('Service type cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  body('status')
    .optional()
    .isIn(['pending', 'assigned', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  validateRequest
];

// Routes
router.get('/', authenticate, ServiceRequestController.getServiceRequests);
router.get('/:id', authenticate, ServiceRequestController.getServiceRequestById);
router.post('/', authenticate, createValidation, ServiceRequestController.createServiceRequest);
router.put('/:id', authenticate, updateValidation, ServiceRequestController.updateServiceRequest);
router.put('/:id/assign', authenticate, ServiceRequestController.assignTechnician);
router.delete('/:id', authenticate, ServiceRequestController.deleteServiceRequest);

export default router;