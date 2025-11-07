const db = require('../database');
const { validationResult } = require('express-validator');

// Get all technicians
const getTechnicians = async (req, res) => {
  try {
    const technicians = await db.technicianModel.getAll();
    res.json(technicians);
  } catch (error) {
    console.error('Error getting technicians:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get technician by ID
const getTechnicianById = async (req, res) => {
  try {
    const technician = await db.technicianModel.findById(req.params.id);
    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }
    res.json(technician);
  } catch (error) {
    console.error('Error getting technician:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new technician
const createTechnician = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const technicianData = {
      ...req.body,
      status: 'available',
      createdAt: new Date(),
    };

    const technician = await db.technicianModel.create(technicianData);
    res.status(201).json(technician);
  } catch (error) {
    console.error('Error creating technician:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update technician
const updateTechnician = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const technician = await db.technicianModel.findById(req.params.id);
    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }

    const updatedTechnician = await db.technicianModel.update(req.params.id, req.body);
    res.json(updatedTechnician);
  } catch (error) {
    console.error('Error updating technician:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete technician
const deleteTechnician = async (req, res) => {
  try {
    const technician = await db.technicianModel.findById(req.params.id);
    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }

    await db.technicianModel.delete(req.params.id);
    res.json({ message: 'Technician deleted successfully' });
  } catch (error) {
    console.error('Error deleting technician:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getTechnicians,
  getTechnicianById,
  createTechnician,
  updateTechnician,
  deleteTechnician,
};