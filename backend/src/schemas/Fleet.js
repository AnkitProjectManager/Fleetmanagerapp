import mongoose from 'mongoose';

const fleetSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Fleet name is required'],
    trim: true,
    maxlength: [100, 'Fleet name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Fleet Owner/Manager
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Fleet owner is required']
  },
  
  // Contact Information
  contactInfo: {
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      validate: {
        validator: function(email) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
        },
        message: 'Please enter a valid email address'
      }
    },
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
      validate: {
        validator: function(phone) {
          return /^[\+]?[1-9][\d]{0,15}$/.test(phone);
        },
        message: 'Please enter a valid phone number'
      }
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true, default: 'US' }
    }
  },
  
  // Business Information
  businessInfo: {
    registrationNumber: String,
    taxId: String,
    licenseNumber: String,
    insuranceProvider: String,
    insurancePolicyNumber: String,
    insuranceExpiry: Date
  },
  
  // Fleet Status & Configuration
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  subscription: {
    plan: {
      type: String,
      enum: ['basic', 'premium', 'enterprise'],
      default: 'basic'
    },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    isActive: { type: Boolean, default: true },
    features: [{
      name: String,
      enabled: { type: Boolean, default: true },
      limit: Number
    }]
  },
  
  // Fleet Metrics
  metrics: {
    totalVehicles: { type: Number, default: 0 },
    activeVehicles: { type: Number, default: 0 },
    totalDrivers: { type: Number, default: 0 },
    totalServiceRequests: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageUtilization: { type: Number, default: 0 }
  },
  
  // Settings
  settings: {
    timezone: { type: String, default: 'UTC' },
    currency: { type: String, default: 'USD' },
    units: {
      distance: { type: String, enum: ['miles', 'kilometers'], default: 'miles' },
      fuel: { type: String, enum: ['gallons', 'liters'], default: 'gallons' },
      temperature: { type: String, enum: ['fahrenheit', 'celsius'], default: 'fahrenheit' }
    },
    notifications: {
      maintenanceReminders: { type: Boolean, default: true },
      serviceRequests: { type: Boolean, default: true },
      lowBattery: { type: Boolean, default: true },
      emergencies: { type: Boolean, default: true }
    },
    operatingHours: {
      enabled: { type: Boolean, default: false },
      hours: [{
        day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
        open: String, // "08:00"
        close: String, // "18:00"
        closed: { type: Boolean, default: false }
      }]
    }
  },
  
  // API Keys & Integrations
  integrations: {
    gpsProvider: {
      name: String,
      apiKey: String,
      enabled: { type: Boolean, default: false }
    },
    paymentProcessor: {
      name: String,
      apiKey: String,
      enabled: { type: Boolean, default: false }
    },
    maintenance: {
      name: String,
      apiKey: String,
      enabled: { type: Boolean, default: false }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
fleetSchema.index({ ownerId: 1 });
fleetSchema.index({ status: 1 });
fleetSchema.index({ 'subscription.plan': 1 });
fleetSchema.index({ createdAt: -1 });

// Virtual for vehicle count
fleetSchema.virtual('vehicleCount', {
  ref: 'Vehicle',
  localField: '_id',
  foreignField: 'fleetId',
  count: true
});

// Virtual for active vehicle count
fleetSchema.virtual('activeVehicleCount', {
  ref: 'Vehicle',
  localField: '_id',
  foreignField: 'fleetId',
  count: true,
  match: { status: 'active' }
});

// Virtual for service request count
fleetSchema.virtual('serviceRequestCount', {
  ref: 'ServiceRequest',
  localField: '_id',
  foreignField: 'fleetId',
  count: true
});

// Virtual for full address
fleetSchema.virtual('fullAddress').get(function() {
  const addr = this.contactInfo?.address;
  if (!addr) return '';
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

// Method to check if subscription is active
fleetSchema.methods.hasActiveSubscription = function() {
  return this.subscription.isActive && 
         (!this.subscription.endDate || this.subscription.endDate > new Date());
};

// Method to check if feature is enabled
fleetSchema.methods.hasFeature = function(featureName) {
  const feature = this.subscription.features.find(f => f.name === featureName);
  return feature ? feature.enabled : false;
};

// Method to get feature limit
fleetSchema.methods.getFeatureLimit = function(featureName) {
  const feature = this.subscription.features.find(f => f.name === featureName);
  return feature ? feature.limit : 0;
};

// Update metrics method
fleetSchema.methods.updateMetrics = async function() {
  const Vehicle = mongoose.model('Vehicle');
  const ServiceRequest = mongoose.model('ServiceRequest');
  
  const [vehicleCount, activeVehicleCount, serviceRequestCount] = await Promise.all([
    Vehicle.countDocuments({ fleetId: this._id }),
    Vehicle.countDocuments({ fleetId: this._id, status: 'active' }),
    ServiceRequest.countDocuments({ fleetId: this._id })
  ]);
  
  this.metrics.totalVehicles = vehicleCount;
  this.metrics.activeVehicles = activeVehicleCount;
  this.metrics.totalServiceRequests = serviceRequestCount;
  
  return this.save();
};

// Static method to find by owner
fleetSchema.statics.findByOwner = function(ownerId) {
  return this.find({ ownerId });
};

// Static method to find active fleets
fleetSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

export default mongoose.models.Fleet || mongoose.model('Fleet', fleetSchema);