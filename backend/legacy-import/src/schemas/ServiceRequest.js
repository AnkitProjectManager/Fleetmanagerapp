import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema({
  // Basic Information
  requestNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  // Request Details
  title: {
    type: String,
    required: [true, 'Service request title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Classification
  category: {
    type: String,
    required: [true, 'Service category is required'],
    enum: [
      'battery_service',
      'charging_issue',
      'electrical_repair',
      'software_update',
      'mechanical_repair',
      'routine_maintenance',
      'emergency_repair',
      'inspection',
      'tire_service',
      'brake_service',
      'other'
    ]
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  urgency: {
    type: String,
    enum: ['routine', 'urgent', 'emergency'],
    default: 'routine'
  },
  
  // Relationships
  fleetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fleet',
    required: [true, 'Fleet ID is required']
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle ID is required']
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requester ID is required']
  },
  assignedTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician'
  },
  
  // Status & Timeline
  status: {
    type: String,
    enum: [
      'pending',       // Just created, waiting for assignment
      'assigned',      // Assigned to technician
      'in_progress',   // Technician is working on it
      'on_hold',       // Waiting for parts/approval
      'completed',     // Work finished
      'cancelled',     // Request cancelled
      'rejected'       // Request rejected
    ],
    default: 'pending'
  },
  
  // Scheduling
  scheduledDate: Date,
  preferredTimeSlot: {
    start: String, // "09:00"
    end: String    // "17:00"
  },
  estimatedDuration: Number, // in hours
  actualStartTime: Date,
  actualEndTime: Date,
  
  // Location
  serviceLocation: {
    type: {
      type: String,
      enum: ['on_site', 'service_center', 'mobile'],
      default: 'service_center'
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    instructions: String
  },
  
  // Service Details
  serviceType: {
    type: String,
    enum: ['repair', 'maintenance', 'inspection', 'upgrade', 'recall'],
    required: true
  },
  partsRequired: [{
    partNumber: String,
    partName: String,
    quantity: { type: Number, default: 1 },
    cost: Number,
    supplier: String,
    ordered: { type: Boolean, default: false },
    received: { type: Boolean, default: false },
    orderDate: Date,
    expectedDelivery: Date
  }],
  
  // Cost & Billing
  costEstimate: {
    labor: { type: Number, default: 0 },
    parts: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  actualCost: {
    labor: { type: Number, default: 0 },
    parts: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  billingStatus: {
    type: String,
    enum: ['pending', 'invoiced', 'paid', 'overdue'],
    default: 'pending'
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  
  // Work Details
  workPerformed: {
    description: String,
    procedures: [String],
    diagnosticCodes: [String],
    recommendations: String,
    followUpRequired: { type: Boolean, default: false },
    followUpDate: Date,
    warrantyInfo: {
      covered: { type: Boolean, default: false },
      warrantyPeriod: Number, // in months
      warrantyExpiry: Date
    }
  },
  
  // Quality & Feedback
  qualityCheck: {
    performed: { type: Boolean, default: false },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: Date,
    passed: { type: Boolean, default: true },
    issues: [String],
    notes: String
  },
  customerFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    wouldRecommend: Boolean,
    submittedDate: Date
  },
  
  // Communication & Updates
  communications: [{
    type: {
      type: String,
      enum: ['note', 'status_update', 'customer_communication', 'internal_note'],
      default: 'note'
    },
    message: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: { type: Date, default: Date.now },
    attachments: [{
      filename: String,
      url: String,
      fileType: String,
      fileSize: Number
    }]
  }],
  
  // Attachments & Documentation
  attachments: [{
    filename: String,
    url: String,
    fileType: String,
    fileSize: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadDate: { type: Date, default: Date.now },
    description: String
  }],
  
  // Photos (before/after, diagnostic, etc.)
  photos: [{
    url: String,
    caption: String,
    type: {
      type: String,
      enum: ['before', 'after', 'diagnostic', 'progress', 'damage', 'completion'],
      default: 'diagnostic'
    },
    takenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Compliance & Safety
  safetyRequirements: {
    required: { type: Boolean, default: false },
    equipmentNeeded: [String],
    certificationRequired: [String],
    hazardousWork: { type: Boolean, default: false },
    specialProcedures: String
  },
  
  // Recurring Service
  isRecurring: { type: Boolean, default: false },
  recurringSchedule: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
    },
    interval: Number, // e.g., every 2 weeks
    endDate: Date,
    nextDue: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
serviceRequestSchema.index({ fleetId: 1 });
serviceRequestSchema.index({ vehicleId: 1 });
serviceRequestSchema.index({ assignedTechnician: 1 });
serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ priority: 1 });
serviceRequestSchema.index({ scheduledDate: 1 });
serviceRequestSchema.index({ createdAt: -1 });

// Compound indexes
serviceRequestSchema.index({ fleetId: 1, status: 1 });
serviceRequestSchema.index({ vehicleId: 1, status: 1 });
serviceRequestSchema.index({ assignedTechnician: 1, status: 1 });

// Virtual for service duration
serviceRequestSchema.virtual('actualDuration').get(function() {
  if (this.actualStartTime && this.actualEndTime) {
    return Math.ceil((this.actualEndTime - this.actualStartTime) / (1000 * 60 * 60)); // hours
  }
  return null;
});

// Virtual for days since created
serviceRequestSchema.virtual('daysSinceCreated').get(function() {
  return Math.ceil((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for overdue status
serviceRequestSchema.virtual('isOverdue').get(function() {
  return this.scheduledDate && this.scheduledDate < new Date() && 
         !['completed', 'cancelled'].includes(this.status);
});

// Virtual for total estimated cost
serviceRequestSchema.virtual('totalEstimatedCost').get(function() {
  return this.costEstimate.labor + this.costEstimate.parts + 
         this.costEstimate.other + this.costEstimate.tax;
});

// Pre-save middleware to generate request number
serviceRequestSchema.pre('validate', async function(next) {
  if (this.isNew && !this.requestNumber) {
    try {
      const year = new Date().getFullYear();
      // Find the last request for the current year to determine the next number
      const lastRequest = await this.constructor.findOne({ requestNumber: new RegExp(`^SR-${year}-`) })
        .sort({ requestNumber: -1 });

      let nextNumber = 1;
      if (lastRequest && lastRequest.requestNumber) {
        const lastNumber = parseInt(lastRequest.requestNumber.split('-')[2], 10);
        nextNumber = lastNumber + 1;
      }
      
      this.requestNumber = `SR-${year}-${String(nextNumber).padStart(6, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Pre-save middleware to update cost totals
serviceRequestSchema.pre('save', function(next) {
  // Update estimate total
  this.costEstimate.total = this.costEstimate.labor + this.costEstimate.parts + 
                           this.costEstimate.other + this.costEstimate.tax;
  
  // Update actual total
  this.actualCost.total = this.actualCost.labor + this.actualCost.parts + 
                         this.actualCost.other + this.actualCost.tax;
  
  next();
});

// Method to add communication
serviceRequestSchema.methods.addCommunication = function(type, message, author, attachments = []) {
  this.communications.push({
    type,
    message,
    author,
    attachments,
    timestamp: new Date()
  });
  return this.save();
};

// Method to update status
serviceRequestSchema.methods.updateStatus = function(newStatus, updatedBy, note = '') {
  const oldStatus = this.status;
  this.status = newStatus;
  
  // Add automatic status change communication
  this.addCommunication(
    'status_update',
    `Status changed from ${oldStatus} to ${newStatus}. ${note}`.trim(),
    updatedBy
  );
  
  // Set timestamps based on status
  if (newStatus === 'in_progress' && !this.actualStartTime) {
    this.actualStartTime = new Date();
  } else if (['completed', 'cancelled'].includes(newStatus) && !this.actualEndTime) {
    this.actualEndTime = new Date();
  }
  
  return this.save();
};

// Method to assign technician
serviceRequestSchema.methods.assignTechnician = function(technicianId, assignedBy) {
  this.assignedTechnician = technicianId;
  this.status = 'assigned';
  
  return this.addCommunication(
    'status_update',
    'Technician assigned to service request',
    assignedBy
  );
};

// Method to add part requirement
serviceRequestSchema.methods.addPart = function(partInfo) {
  this.partsRequired.push(partInfo);
  
  // Update parts cost in estimate
  const partsCost = this.partsRequired.reduce((sum, part) => sum + (part.cost || 0), 0);
  this.costEstimate.parts = partsCost;
  
  return this.save();
};

// Method to mark part as received
serviceRequestSchema.methods.markPartReceived = function(partId) {
  const part = this.partsRequired.id(partId);
  if (part) {
    part.received = true;
    return this.save();
  }
  throw new Error('Part not found');
};

// Static method to find by request number
serviceRequestSchema.statics.findByRequestNumber = function(requestNumber) {
  return this.findOne({ requestNumber });
};

// Static method to find by status
serviceRequestSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

// Static method to find overdue requests
serviceRequestSchema.statics.findOverdue = function() {
  return this.find({
    scheduledDate: { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled'] }
  });
};

// Static method to find by technician
serviceRequestSchema.statics.findByTechnician = function(technicianId) {
  return this.find({ assignedTechnician: technicianId });
};

// Static method to get requests needing parts
serviceRequestSchema.statics.findNeedingParts = function() {
  return this.find({
    'partsRequired': { $exists: true, $ne: [] },
    'partsRequired.ordered': false
  });
};

export default mongoose.models.ServiceRequest || mongoose.model('ServiceRequest', serviceRequestSchema);