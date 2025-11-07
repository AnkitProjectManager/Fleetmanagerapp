import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  vehicleId: {
    type: String,
    required: [true, 'Vehicle ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  make: {
    type: String,
    required: [true, 'Vehicle make is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Vehicle model is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Vehicle year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  type: {
    type: String,
    enum: ['electric', 'hybrid', 'gasoline', 'diesel'],
    required: [true, 'Vehicle type is required']
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'out_of_service', 'retired'],
    default: 'active'
  },
  licensePlate: {
    type: String,
    required: [true, 'License plate is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  vin: {
    type: String,
    required: [true, 'VIN is required'],
    unique: true,
    trim: true,
    uppercase: true,
    minlength: [17, 'VIN must be 17 characters'],
    maxlength: [17, 'VIN must be 17 characters']
  },
  color: {
    type: String,
    trim: true
  },
  mileage: {
    type: Number,
    min: [0, 'Mileage cannot be negative'],
    default: 0
  },
  batteryCapacity: {
    type: Number,
    min: [0, 'Battery capacity cannot be negative']
  },
  range: {
    type: Number,
    min: [0, 'Range cannot be negative']
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  fleetManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    latitude: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    },
    address: String,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  maintenance: {
    lastService: Date,
    nextService: Date,
    serviceInterval: {
      type: Number,
      default: 10000 // miles
    }
  },
  insurance: {
    provider: String,
    policyNumber: String,
    expiryDate: Date
  },
  registration: {
    expiryDate: Date,
    state: String
  },
  purchaseInfo: {
    purchaseDate: Date,
    purchasePrice: Number,
    warranty: {
      expiryDate: Date,
      type: String
    }
  },
  specifications: {
    fuelType: String,
    transmission: String,
    engineSize: String,
    seatingCapacity: Number,
    cargoCapacity: Number
  },
  documents: [{
    type: {
      type: String,
      enum: ['registration', 'insurance', 'maintenance', 'inspection', 'other']
    },
    name: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  notes: [{
    content: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for performance (unique fields auto-indexed)
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ assignedDriver: 1 });
vehicleSchema.index({ fleetManager: 1 });

// Virtual for service due status
vehicleSchema.virtual('isServiceDue').get(function() {
  if (!this.maintenance.nextService) return false;
  return this.maintenance.nextService <= new Date();
});

// Virtual for display name
vehicleSchema.virtual('displayName').get(function() {
  return `${this.year} ${this.make} ${this.model} (${this.licensePlate})`;
});

// Method to calculate next service date
vehicleSchema.methods.calculateNextService = function() {
  if (this.maintenance.lastService && this.maintenance.serviceInterval) {
    const lastServiceMileage = this.mileage - this.maintenance.serviceInterval;
    const nextServiceMileage = lastServiceMileage + this.maintenance.serviceInterval;
    
    // Estimate date based on average daily driving (50 miles/day)
    const daysUntilService = (nextServiceMileage - this.mileage) / 50;
    return new Date(Date.now() + (daysUntilService * 24 * 60 * 60 * 1000));
  }
  return null;
};

export default mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);