import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema({
  name: String,
  type: String,
  essential: { type: Boolean, default: true }
}, { _id: false });

const serviceSchema = new mongoose.Schema({
  // Service Identification
  serviceCode: {
    type: String,
    required: [true, 'Service code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Service Classification
  category: {
    type: String,
    required: [true, 'Service category is required'],
    enum: [
      'battery_maintenance',
      'charging_system',
      'electrical_diagnostics',
      'software_update',
      'mechanical_repair',
      'preventive_maintenance',
      'emergency_service',
      'inspection',
      'tire_service',
      'brake_service',
      'hvac_service',
      'bodywork',
      'glass_repair',
      'interior_service',
      'other'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  serviceType: {
    type: String,
    enum: ['repair', 'maintenance', 'inspection', 'upgrade', 'emergency'],
    required: true
  },
  
  // Pricing Information
  pricing: {
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    },
    pricingModel: {
      type: String,
      enum: ['flat_rate', 'hourly', 'per_mile', 'diagnostic_plus_repair', 'quote_only'],
      default: 'flat_rate'
    },
    laborRate: Number, // per hour if applicable
    minimumCharge: {
      type: Number,
      default: 0
    },
    maximumCharge: Number,
    // Tiered pricing based on vehicle type, fleet size, etc.
    tierPricing: [{
      tier: String, // 'premium_fleet', 'standard_fleet', 'single_vehicle'
      multiplier: { type: Number, default: 1.0 },
      fixedPrice: Number
    }]
  },
  
  // Service Requirements
  requirements: {
    // Time requirements
    estimatedDuration: {
      min: { type: Number, required: true }, // in minutes
      max: { type: Number, required: true }
    },
    // Skill requirements
    skillLevelRequired: {
      type: String,
      enum: ['apprentice', 'junior', 'senior', 'master', 'specialist'],
      default: 'junior'
    },
    specializationRequired: [{
      type: String,
      enum: [
        'battery_systems',
        'charging_systems',
        'electrical_diagnostics',
        'software_programming',
        'mechanical_repair',
        'hvac_systems',
        'brake_systems',
        'suspension',
        'tire_service',
        'high_voltage_systems'
      ]
    }],
    // Certification requirements
    certificationRequired: [String],
    // Equipment/tools needed
    equipmentRequired: [equipmentSchema],
    // Parts typically needed
    commonParts: [{
      partNumber: String,
      partName: String,
      quantity: { type: Number, default: 1 },
      optional: { type: Boolean, default: false },
      estimatedCost: Number
    }]
  },
  
  // Service Details
  procedures: [{
    step: Number,
    description: String,
    estimatedTime: Number, // in minutes
    safetyNotes: String,
    toolsRequired: [String],
    checkpoints: [String]
  }],
  
  // Safety & Compliance
  safety: {
    hazardLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    safetyEquipmentRequired: [String],
    specialPrecautions: String,
    highVoltageWork: { type: Boolean, default: false },
    confinedSpaceWork: { type: Boolean, default: false },
    liftRequired: { type: Boolean, default: false }
  },
  
  // Service Availability
  availability: {
    enabled: { type: Boolean, default: true },
    mobileService: { type: Boolean, default: false },
    onSiteService: { type: Boolean, default: true },
    emergencyService: { type: Boolean, default: false },
    // Service hours
    serviceHours: {
      enabled: { type: Boolean, default: false },
      hours: [{
        day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
        available: { type: Boolean, default: true },
        startTime: String, // "08:00"
        endTime: String    // "17:00"
      }]
    },
    // Geographic availability
    serviceAreas: [{
      name: String,
      coordinates: [[Number]], // Polygon coordinates for service area
      additionalFee: { type: Number, default: 0 }
    }]
  },
  
  // Quality & Warranty
  quality: {
    warrantyPeriod: {
      type: Number, // in months
      default: 3
    },
    qualityChecksRequired: { type: Boolean, default: true },
    followUpRequired: { type: Boolean, default: false },
    followUpDays: { type: Number, default: 7 },
    customerApprovalRequired: { type: Boolean, default: false }
  },
  
  // Performance Metrics
  metrics: {
    totalServicesPerformed: { type: Number, default: 0 },
    averageDuration: { type: Number, default: 0 }, // in minutes
    averageRating: { type: Number, default: 0 },
    averageCost: { type: Number, default: 0 },
    successRate: { type: Number, default: 100 }, // percentage
    reworkRate: { type: Number, default: 0 }, // percentage
    monthlyStats: [{
      month: Date,
      servicesPerformed: Number,
      averageRating: Number,
      averageDuration: Number,
      revenue: Number
    }]
  },
  
  // Documentation & Resources
  documentation: {
    serviceManual: String, // URL to service manual
    videoGuide: String,    // URL to video guide
    diagrams: [String],    // URLs to diagnostic diagrams
    troubleshootingGuide: String,
    knowledgeBaseArticles: [String]
  },
  
  // Integration & Automation
  integration: {
    diagnosticCodes: [String], // Related OBD/diagnostic codes
    apiEndpoints: [{
      name: String,
      url: String,
      method: String,
      description: String
    }],
    automationRules: [{
      trigger: String,
      action: String,
      conditions: [String]
    }]
  },
  
  // Service History & Evolution
  history: {
    version: { type: Number, default: 1.0 },
    lastUpdated: { type: Date, default: Date.now },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changeLog: [{
      version: Number,
      date: Date,
      changes: String,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  },
  
  // Tags & Search
  tags: [String],
  keywords: [String], // For search optimization
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'deprecated', 'development'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
serviceSchema.index({ category: 1 });
serviceSchema.index({ serviceType: 1 });
serviceSchema.index({ status: 1 });
serviceSchema.index({ 'pricing.basePrice': 1 });
serviceSchema.index({ tags: 1 });
serviceSchema.index({ keywords: 1 });

// Text index for search
serviceSchema.index({
  name: 'text',
  description: 'text',
  keywords: 'text',
  tags: 'text'
});

// Virtual for estimated price range
serviceSchema.virtual('estimatedPriceRange').get(function() {
  const basePrice = this.pricing.basePrice;
  const minDuration = this.requirements.estimatedDuration.min / 60; // convert to hours
  const maxDuration = this.requirements.estimatedDuration.max / 60;
  
  if (this.pricing.pricingModel === 'hourly' && this.pricing.laborRate) {
    return {
      min: Math.round(minDuration * this.pricing.laborRate),
      max: Math.round(maxDuration * this.pricing.laborRate)
    };
  }
  
  return {
    min: basePrice,
    max: basePrice
  };
});

// Virtual for availability status
serviceSchema.virtual('isAvailable').get(function() {
  return this.status === 'active' && this.availability.enabled;
});

// Virtual for complexity score (based on requirements)
serviceSchema.virtual('complexityScore').get(function() {
  let score = 0;
  
  // Duration complexity
  const avgDuration = (this.requirements.estimatedDuration.min + this.requirements.estimatedDuration.max) / 2;
  score += Math.min(avgDuration / 60, 5); // Max 5 points for duration
  
  // Skill level complexity
  const skillLevels = ['apprentice', 'junior', 'senior', 'master', 'specialist'];
  score += skillLevels.indexOf(this.requirements.skillLevelRequired) + 1;
  
  // Specialization complexity
  score += this.requirements.specializationRequired.length;
  
  // Safety complexity
  const hazardLevels = ['low', 'medium', 'high', 'critical'];
  score += hazardLevels.indexOf(this.safety.hazardLevel) + 1;
  
  return Math.min(score, 10); // Cap at 10
});

// Method to calculate price for specific context
serviceSchema.methods.calculatePrice = function(context = {}) {
  let price = this.pricing.basePrice;
  
  // Apply tier pricing if applicable
  if (context.tier && this.pricing.tierPricing.length > 0) {
    const tierPrice = this.pricing.tierPricing.find(t => t.tier === context.tier);
    if (tierPrice) {
      price = tierPrice.fixedPrice || (price * tierPrice.multiplier);
    }
  }
  
  // Apply hourly pricing if applicable
  if (this.pricing.pricingModel === 'hourly' && context.estimatedHours && this.pricing.laborRate) {
    price = context.estimatedHours * this.pricing.laborRate;
  }
  
  // Apply minimum charge
  if (this.pricing.minimumCharge && price < this.pricing.minimumCharge) {
    price = this.pricing.minimumCharge;
  }
  
  // Apply maximum charge
  if (this.pricing.maximumCharge && price > this.pricing.maximumCharge) {
    price = this.pricing.maximumCharge;
  }
  
  // Apply additional fees (service area, etc.)
  if (context.additionalFees) {
    price += context.additionalFees;
  }
  
  return Math.round(price * 100) / 100; // Round to 2 decimal places
};

// Method to check if technician qualifies for this service
serviceSchema.methods.technicianQualifies = function(technician) {
  // Check skill level
  const skillLevels = ['apprentice', 'junior', 'senior', 'master', 'specialist'];
  const requiredSkillIndex = skillLevels.indexOf(this.requirements.skillLevelRequired);
  const technicianSkillIndex = skillLevels.indexOf(technician.skillLevel);
  
  if (technicianSkillIndex < requiredSkillIndex) {
    return false;
  }
  
  // Check specializations
  if (this.requirements.specializationRequired.length > 0) {
    const hasRequiredSpecialization = this.requirements.specializationRequired.some(
      spec => technician.specializations.includes(spec)
    );
    if (!hasRequiredSpecialization) {
      return false;
    }
  }
  
  // Check certifications
  if (this.requirements.certificationRequired.length > 0) {
    const activeCertNames = technician.activeCertifications.map(cert => cert.name);
    const hasRequiredCerts = this.requirements.certificationRequired.every(
      cert => activeCertNames.includes(cert)
    );
    if (!hasRequiredCerts) {
      return false;
    }
  }
  
  return true;
};

// Method to update performance metrics
serviceSchema.methods.updateMetrics = function(serviceData) {
  this.metrics.totalServicesPerformed += 1;
  
  // Update averages
  const total = this.metrics.totalServicesPerformed;
  
  if (serviceData.duration) {
    this.metrics.averageDuration = 
      ((this.metrics.averageDuration * (total - 1)) + serviceData.duration) / total;
  }
  
  if (serviceData.rating) {
    this.metrics.averageRating = 
      ((this.metrics.averageRating * (total - 1)) + serviceData.rating) / total;
  }
  
  if (serviceData.cost) {
    this.metrics.averageCost = 
      ((this.metrics.averageCost * (total - 1)) + serviceData.cost) / total;
  }
  
  return this.save();
};

// Static method to find by category
serviceSchema.statics.findByCategory = function(category) {
  return this.find({ category, status: 'active' });
};

// Static method to find by service type
serviceSchema.statics.findByType = function(serviceType) {
  return this.find({ serviceType, status: 'active' });
};

// Static method to search services
serviceSchema.statics.searchServices = function(searchTerm) {
  return this.find({
    $text: { $search: searchTerm },
    status: 'active'
  }).sort({ score: { $meta: 'textScore' } });
};

// Static method to find services by price range
serviceSchema.statics.findByPriceRange = function(minPrice, maxPrice) {
  return this.find({
    'pricing.basePrice': { $gte: minPrice, $lte: maxPrice },
    status: 'active'
  });
};

// Static method to find services for technician
serviceSchema.statics.findForTechnician = function(technician) {
  const skillLevels = ['apprentice', 'junior', 'senior', 'master', 'specialist'];
  const technicianSkillIndex = skillLevels.indexOf(technician.skillLevel);
  const eligibleSkillLevels = skillLevels.slice(0, technicianSkillIndex + 1);
  
  return this.find({
    status: 'active',
    'requirements.skillLevelRequired': { $in: eligibleSkillLevels },
    'requirements.specializationRequired': { 
      $in: [...technician.specializations, []] 
    }
  });
};

export default mongoose.models.Service || mongoose.model('Service', serviceSchema);