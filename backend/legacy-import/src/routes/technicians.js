const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const technicianController = require('../controllers/technicianController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// Validation rules for technicians
const createValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('specialties').isArray({ min: 1 }).withMessage('At least one specialty is required'),
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
];

const updateValidation = [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().notEmpty().withMessage('Phone number cannot be empty'),
  body('specialties').optional().isArray({ min: 1 }).withMessage('At least one specialty is required'),
  body('status')
    .optional()
    .isIn(['available', 'busy', 'unavailable'])
    .withMessage('Status must be available, busy, or unavailable'),
];

// Routes - Only admins and fleet managers can manage technicians
router.get('/', auth, technicianController.getTechnicians);
router.get('/:id', auth, technicianController.getTechnicianById);
router.post('/', auth, roleAuth(['admin', 'fleet_manager']), createValidation, technicianController.createTechnician);
router.put('/:id', auth, roleAuth(['admin', 'fleet_manager']), updateValidation, technicianController.updateTechnician);
router.delete('/:id', auth, roleAuth(['admin', 'fleet_manager']), technicianController.deleteTechnician);

module.exports = router;