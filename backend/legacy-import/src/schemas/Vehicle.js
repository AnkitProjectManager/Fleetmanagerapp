import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  // Basic Vehicle Information
  vin: {
    type: String,
    required: [true, 'VIN is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [17, 'VIN must be exactly 17 characters'],
    maxlength: [17, 'VIN must be exactly 17 characters'],
    validate: {
      validator: function(vin) {
        // Basic VIN validation (17 alphanumeric characters, no I, O, Q)
        return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
      },
      message: 'Invalid VIN format'
    }
  },
  
  // Vehicle Details
  make: {
    type: String,
    required: [true, 'Vehicle make is required'],
    trim: true,
    maxlength: [50, 'Make cannot exceed 50 characters']
  },
  model: {
    type: String,
    required: [true, 'Vehicle model is required'],
    trim: true,
    maxlength: [50, 'Model cannot exceed 50 characters']
  },
  year: {
    type: Number,
    required: [true, 'Vehicle year is required'],
    min: [1900, 'Year must be 1900 or later'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  color: {
    type: String,
    trim: true,
    maxlength: [30, 'Color cannot exceed 30 characters']
  },
  
  // Electric Vehicle Specific
  batteryInfo: {
    capacity: { // in kWh
      type: Number,
      required: [true, 'Battery capacity is required'],
      min: [1, 'Battery capacity must be positive']
    },
    currentLevel: { // percentage (0-100)
      type: Number,
      default: 100,
      min: [0, 'Battery level cannot be negative'],
      max: [100, 'Battery level cannot exceed 100%']
    },
    range: { // estimated range in miles/km
      type: Number,
      min: [1, 'Range must be positive']
    },
    chargingStatus: {
      type: String,
      enum: ['charging', 'not_charging', 'fault'],
      default: 'not_charging'
    },
    lastChargeDate: Date,
    chargingCycles: { type: Number, default: 0 },
    batteryHealth: { // percentage (0-100)
      type: Number,
      default: 100,
      min: [0, 'Battery health cannot be negative'],
      max: [100, 'Battery health cannot exceed 100%']
    }
  },
  
  // Registration & Legal
  licensePlate: {
    type: String,
    required: [true, 'License plate is required'],
    uppercase: true,
    trim: true,
    maxlength: [15, 'License plate cannot exceed 15 characters']
  },
  registrationExpiry: Date,
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    expiryDate: Date,
    coverage: {
      liability: { type: Boolean, default: true },
      collision: { type: Boolean, default: true },
      comprehensive: { type: Boolean, default: true }
    }
  },
  
  // Fleet Assignment
  fleetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fleet',
    required: [true, 'Fleet ID is required']
  },
  assignedDriverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Vehicle Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'retired'],
    default: 'active'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: String,
    lastUpdated: { type: Date, default: Date.now }
  },
  
  // Maintenance Information
  maintenance: {
    lastServiceDate: Date,
    nextServiceDate: Date,
    mileage: { type: Number, default: 0, min: 0 },
    serviceIntervalMiles: { type: Number, default: 10000 },
    serviceIntervalMonths: { type: Number, default: 12 },
    maintenanceAlerts: [{
      type: {
        type: String,
        enum: ['oil_change', 'battery_check', 'tire_rotation', 'brake_inspection', 'general_inspection']
      },
      dueDate: Date,
      dueMileage: Number,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
      },
      completed: { type: Boolean, default: false }
    }]
  },
  
  // Usage Statistics
  usage: {
    totalMiles: { type: Number, default: 0 },
    totalHours: { type: Number, default: 0 },
    averageMilesPerDay: { type: Number, default: 0 },
    fuelEfficiency: Number, // miles per kWh for electric
    utilizationRate: { type: Number, default: 0 } // percentage
  },
  
  // Vehicle Features & Equipment
  features: [{
    name: String,
    description: String,
    installed: { type: Boolean, default: true },
    installedDate: Date
  }],
  
  // Images & Documents
  images: [{
    url: String,
    type: {
      type: String,
      enum: ['exterior', 'interior', 'dashboard', 'damage', 'other'],
      default: 'other'
    },
    uploadDate: { type: Date, default: Date.now }
  }],
  documents: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['registration', 'insurance', 'manual', 'warranty', 'other'],
      default: 'other'
    },
    uploadDate: { type: Date, default: Date.now }
  }],
  
  // Purchase Information
  purchaseInfo: {
    purchaseDate: Date,
    purchasePrice: Number,
    dealer: String,
    warrantyExpiry: Date,
    financingInfo: {
      isFinanced: { type: Boolean, default: false },
      lender: String,
      monthlyPayment: Number,
      remainingBalance: Number
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
vehicleSchema.index({ licensePlate: 1 });
vehicleSchema.index({ fleetId: 1 });
vehicleSchema.index({ assignedDriverId: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ 'location.coordinates': '2dsphere' });
vehicleSchema.index({ 'batteryInfo.currentLevel': 1 });

// Virtual for full vehicle name
vehicleSchema.virtual('fullName').get(function() {
  return `${this.year} ${this.make} ${this.model}`;
});

// Virtual for battery status
vehicleSchema.virtual('batteryStatus').get(function() {
  const level = this.batteryInfo.currentLevel;
  if (level <= 20) return 'critical';
  if (level <= 40) return 'low';
  if (level <= 70) return 'medium';
  return 'good';
});

// Virtual for maintenance status
vehicleSchema.virtual('maintenanceStatus').get(function() {
  const now = new Date();
  const nextService = this.maintenance.nextServiceDate;
  
  if (!nextService) return 'unknown';
  if (nextService < now) return 'overdue';
  
  const daysUntilService = Math.ceil((nextService - now) / (1000 * 60 * 60 * 24));
  if (daysUntilService <= 7) return 'due_soon';
  if (daysUntilService <= 30) return 'upcoming';
  
  return 'current';
});

// Virtual for estimated range based on current battery level
vehicleSchema.virtual('currentRange').get(function() {
  if (!this.batteryInfo.range) return 0;
  return Math.round((this.batteryInfo.range * this.batteryInfo.currentLevel) / 100);
});

// Method to update location
vehicleSchema.methods.updateLocation = function(longitude, latitude, address = '') {
  this.location.coordinates = [longitude, latitude];
  this.location.address = address;
  this.location.lastUpdated = new Date();
  return this.save();
};

// Method to update battery level
vehicleSchema.methods.updateBatteryLevel = function(level) {
  if (level < 0 || level > 100) {
    throw new Error('Battery level must be between 0 and 100');
  }
  this.batteryInfo.currentLevel = level;
  return this.save();
};

// Method to add maintenance alert
vehicleSchema.methods.addMaintenanceAlert = function(type, dueDate, dueMileage, priority = 'medium') {
  this.maintenance.maintenanceAlerts.push({
    type,
    dueDate,
    dueMileage,
    priority,
    completed: false
  });
  return this.save();
};

// Method to complete maintenance alert
vehicleSchema.methods.completeMaintenanceAlert = function(alertId) {
  const alert = this.maintenance.maintenanceAlerts.id(alertId);
  if (alert) {
    alert.completed = true;
    return this.save();
  }
  throw new Error('Maintenance alert not found');
};

// Method to calculate next service date
vehicleSchema.methods.calculateNextService = function() {
  const lastService = this.maintenance.lastServiceDate || this.createdAt;
  const intervalMonths = this.maintenance.serviceIntervalMonths;
  
  const nextService = new Date(lastService);
  nextService.setMonth(nextService.getMonth() + intervalMonths);
  
  this.maintenance.nextServiceDate = nextService;
  return this.save();
};

// Static method to find by VIN
vehicleSchema.statics.findByVin = function(vin) {
  return this.findOne({ vin: vin.toUpperCase() });
};

// Static method to find by fleet
vehicleSchema.statics.findByFleet = function(fleetId) {
  return this.find({ fleetId });
};

// Static method to find by license plate
vehicleSchema.statics.findByLicensePlate = function(licensePlate) {
  return this.findOne({ licensePlate: licensePlate.toUpperCase() });
};

// Static method to find vehicles needing maintenance
vehicleSchema.statics.findNeedingMaintenance = function() {
  const now = new Date();
  return this.find({
    $or: [
      { 'maintenance.nextServiceDate': { $lt: now } },
      { 'maintenance.maintenanceAlerts.dueDate': { $lt: now, completed: false } }
    ]
  });
};

// Static method to find low battery vehicles
vehicleSchema.statics.findLowBattery = function(threshold = 20) {
  return this.find({
    'batteryInfo.currentLevel': { $lte: threshold },
    status: 'active'
  });
};

export default mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);