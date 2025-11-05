import express from 'express';
import authRoutes from './auth.js';
import vehicleRoutes from './vehicles.js';
import serviceRequestRoutes from './serviceRequests.js';
import technicianRoutes from './technicians.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Roll and Charge Fleet Manager Portal API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/service-requests', serviceRequestRoutes);
router.use('/technicians', technicianRoutes);

export default router;