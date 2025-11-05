const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const serviceController = require('../controllers/serviceController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// Validation rules for services
const createValidation = [
  body('name').notEmpty().withMessage('Service name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('estimatedDuration').isNumeric().withMessage('Estimated duration must be a number'),
  body('price').isNumeric().withMessage('Price must be a number'),
];

const updateValidation = [
  body('name').optional().notEmpty().withMessage('Service name cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty'),
  body('estimatedDuration').optional().isNumeric().withMessage('Estimated duration must be a number'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
];

// Routes
router.get('/', auth, serviceController.getServices);
router.get('/:id', auth, serviceController.getServiceById);
router.post('/', auth, roleAuth(['admin', 'fleet_manager']), createValidation, serviceController.createService);
router.put('/:id', auth, roleAuth(['admin', 'fleet_manager']), updateValidation, serviceController.updateService);
router.delete('/:id', auth, roleAuth(['admin', 'fleet_manager']), serviceController.deleteService);

module.exports = router;