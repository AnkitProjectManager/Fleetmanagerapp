import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'SR-' + Date.now().toString(36).toUpperCase();
    }
  },
  title: {
    type: String,
    required: [true, 'Service request title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Service request description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required']
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requestor is required']
  },
  assignedTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['maintenance', 'repair', 'inspection', 'cleaning', 'fuel', 'battery', 'other'],
    required: [true, 'Category is required']
  },
  status: {
    type: String,
    enum: ['open', 'assigned', 'in_progress', 'completed', 'cancelled', 'on_hold'],
    default: 'open'
  },
  urgency: {
    type: String,
    enum: ['can_wait', 'schedule_soon', 'asap', 'emergency'],
    default: 'schedule_soon'
  },
  estimatedCost: {
    type: Number,
    min: [0, 'Cost cannot be negative'],
    default: 0
  },
  actualCost: {
    type: Number,
    min: [0, 'Cost cannot be negative'],
    default: 0
  },
  estimatedDuration: {
    type: Number, // in hours
    min: [0, 'Duration cannot be negative']
  },
  actualDuration: {
    type: Number, // in hours
    min: [0, 'Duration cannot be negative']
  },
  scheduledDate: {
    type: Date
  },
  startDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  location: {
    type: String,
    enum: ['on_site', 'service_center', 'dealership', 'mobile_service'],
    default: 'service_center'
  },
  serviceProvider: {
    name: String,
    contact: String,
    address: String
  },
  workPerformed: {
    type: String,
    trim: true,
    maxlength: [2000, 'Work performed description cannot exceed 2000 characters']
  },
  partsUsed: [{
    partName: {
      type: String,
      required: true,
      trim: true
    },
    partNumber: {
      type: String,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    unitCost: {
      type: Number,
      required: true,
      min: [0, 'Cost cannot be negative']
    },
    totalCost: {
      type: Number,
      required: true,
      min: [0, 'Cost cannot be negative']
    }
  }],
  laborHours: {
    type: Number,
    min: [0, 'Labor hours cannot be negative'],
    default: 0
  },
  laborRate: {
    type: Number,
    min: [0, 'Labor rate cannot be negative'],
    default: 0
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  comments: [{
    content: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isInternal: {
      type: Boolean,
      default: false
    }
  }],
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    reason: String
  }],
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  warranty: {
    isUnderWarranty: {
      type: Boolean,
      default: false
    },
    warrantyProvider: String,
    claimNumber: String
  },
  approval: {
    required: {
      type: Boolean,
      default: false
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    approvalNotes: String
  }
}, {
  timestamps: true
});

// Indexes for performance (unique fields auto-indexed)
serviceRequestSchema.index({ vehicle: 1 });
serviceRequestSchema.index({ requestedBy: 1 });
serviceRequestSchema.index({ assignedTechnician: 1 });
serviceRequestSchema.index({ status: 1, priority: 1 });
serviceRequestSchema.index({ scheduledDate: 1 });
serviceRequestSchema.index({ createdAt: -1 });

// Virtual for total cost
serviceRequestSchema.virtual('totalCost').get(function() {
  const partsCost = this.partsUsed.reduce((total, part) => total + part.totalCost, 0);
  const laborCost = this.laborHours * this.laborRate;
  return partsCost + laborCost;
});

// Virtual for service age in days
serviceRequestSchema.virtual('ageInDays').get(function() {
  return Math.ceil((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for overdue status
serviceRequestSchema.virtual('isOverdue').get(function() {
  if (this.scheduledDate && this.status !== 'completed' && this.status !== 'cancelled') {
    return this.scheduledDate < new Date();
  }
  return false;
});

// Method to add status change
serviceRequestSchema.methods.changeStatus = function(newStatus, changedBy, reason) {
  this.statusHistory.push({
    status: this.status,
    changedBy,
    reason
  });
  
  this.status = newStatus;
  
  if (newStatus === 'in_progress' && !this.startDate) {
    this.startDate = new Date();
  } else if (newStatus === 'completed' && !this.completedDate) {
    this.completedDate = new Date();
  }
};

// Method to calculate total parts cost
serviceRequestSchema.methods.calculatePartsCost = function() {
  return this.partsUsed.reduce((total, part) => total + part.totalCost, 0);
};

// Method to calculate labor cost
serviceRequestSchema.methods.calculateLaborCost = function() {
  return this.laborHours * this.laborRate;
};

export default mongoose.models.ServiceRequest || mongoose.model('ServiceRequest', serviceRequestSchema);