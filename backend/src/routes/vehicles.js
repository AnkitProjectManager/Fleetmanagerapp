import express from 'express';
import { body, query } from 'express-validator';
import { VehicleController } from '../controllers/vehicleController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

// All vehicle routes require authentication
router.use(authenticate);

// Validation rules
const createVehicleValidation = [
  body('vin')
    .notEmpty()
    .withMessage('VIN is required')
    .isLength({ min: 17, max: 17 })
    .withMessage('VIN must be exactly 17 characters')
    .matches(/^[A-HJ-NPR-Z0-9]{17}$/)
    .withMessage('Invalid VIN format'),
  body('make')
    .trim()
    .notEmpty()
    .withMessage('Make is required')
    .isLength({ max: 50 })
    .withMessage('Make cannot exceed 50 characters'),
  body('model')
    .trim()
    .notEmpty()
    .withMessage('Model is required')
    .isLength({ max: 50 })
    .withMessage('Model cannot exceed 50 characters'),
  body('year')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(`Year must be between 1900 and ${new Date().getFullYear() + 1}`),
  body('licensePlate')
    .trim()
    .notEmpty()
    .withMessage('License plate is required')
    .isLength({ max: 20 })
    .withMessage('License plate cannot exceed 20 characters'),
  body('batteryCapacity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Battery capacity must be a positive number'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'in_service', 'maintenance'])
    .withMessage('Invalid status'),
  validateRequest
];

const updateVehicleValidation = [
  body('vin')
    .optional()
    .isLength({ min: 17, max: 17 })
    .withMessage('VIN must be exactly 17 characters')
    .matches(/^[A-HJ-NPR-Z0-9]{17}$/)
    .withMessage('Invalid VIN format'),
  body('make')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Make cannot exceed 50 characters'),
  body('model')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Model cannot exceed 50 characters'),
  body('year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(`Year must be between 1900 and ${new Date().getFullYear() + 1}`),
  body('licensePlate')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('License plate cannot exceed 20 characters'),
  body('batteryCapacity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Battery capacity must be a positive number'),
  body('currentBatteryLevel')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Battery level must be between 0 and 100'),
  body('mileage')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Mileage must be a positive number'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'in_service', 'maintenance'])
    .withMessage('Invalid status'),
  validateRequest
];

const getVehiclesValidation = [
  query('fleetId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Fleet ID must be a positive integer'),
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'in_service', 'maintenance'])
    .withMessage('Invalid status filter'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term cannot exceed 100 characters'),
  validateRequest
];

// Routes
router.get('/', getVehiclesValidation, VehicleController.getVehicles);
router.get('/:id', VehicleController.getVehicle);
router.get('/:id/service-history', VehicleController.getServiceHistory);
router.post('/', createVehicleValidation, VehicleController.createVehicle);
router.put('/:id', updateVehicleValidation, VehicleController.updateVehicle);
router.delete('/:id', authorize('admin', 'fleet_manager'), VehicleController.deleteVehicle);

export default router;