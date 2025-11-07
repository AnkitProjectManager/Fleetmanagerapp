import mongoose from 'mongoose';

const technicianSchema = new mongoose.Schema({
  // Personal Information
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
      },
      message: 'Please enter a valid email address'
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(phone) {
        return /^[\+]?[1-9][\d]{0,15}$/.test(phone);
      },
      message: 'Please enter a valid phone number'
    }
  },
  
  // Professional Information
  specializations: [{
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
      'general_maintenance',
      'emergency_repair',
      'high_voltage_systems'
    ]
  }],
  certifications: [{
    name: String,
    issuingOrganization: String,
    certificationNumber: String,
    issueDate: Date,
    expiryDate: Date,
    isActive: { type: Boolean, default: true },
    renewalRequired: { type: Boolean, default: false }
  }],
  skillLevel: {
    type: String,
    enum: ['apprentice', 'junior', 'senior', 'master', 'specialist'],
    default: 'junior'
  },
  yearsOfExperience: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // Employment Details
  employmentStatus: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'terminated'],
    default: 'active'
  },
  employmentType: {
    type: String,
    enum: ['full_time', 'part_time', 'contract', 'freelance'],
    default: 'full_time'
  },
  hireDate: {
    type: Date,
    required: [true, 'Hire date is required']
  },
  terminationDate: Date,
  department: {
    type: String,
    default: 'Service'
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Availability & Scheduling
  availability: {
    status: {
      type: String,
      enum: ['available', 'busy', 'off_duty', 'on_break', 'vacation', 'sick_leave'],
      default: 'available'
    },
    workingHours: {
      monday: { start: String, end: String, working: { type: Boolean, default: true } },
      tuesday: { start: String, end: String, working: { type: Boolean, default: true } },
      wednesday: { start: String, end: String, working: { type: Boolean, default: true } },
      thursday: { start: String, end: String, working: { type: Boolean, default: true } },
      friday: { start: String, end: String, working: { type: Boolean, default: true } },
      saturday: { start: String, end: String, working: { type: Boolean, default: false } },
      sunday: { start: String, end: String, working: { type: Boolean, default: false } }
    },
    maxConcurrentJobs: {
      type: Number,
      default: 3,
      min: 1,
      max: 10
    },
    currentJobCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // Location & Service Area
  location: {
    current: {
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
    homeBase: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      },
      address: String
    },
    serviceRadius: {
      type: Number, // in miles
      default: 50
    }
  },
  
  // Performance Metrics
  performance: {
    totalJobsCompleted: { type: Number, default: 0 },
    averageJobTime: { type: Number, default: 0 }, // in hours
    customerRating: { type: Number, default: 5.0, min: 0, max: 5 },
    onTimePercentage: { type: Number, default: 100, min: 0, max: 100 },
    qualityScore: { type: Number, default: 100, min: 0, max: 100 },
    monthlyMetrics: [{
      month: Date,
      jobsCompleted: Number,
      averageRating: Number,
      revenue: Number,
      hoursWorked: Number
    }]
  },
  
  // Equipment & Tools
  equipment: [{
    name: String,
    type: {
      type: String,
      enum: ['vehicle', 'diagnostic_tool', 'hand_tool', 'safety_equipment', 'specialized_equipment']
    },
    model: String,
    serialNumber: String,
    assignedDate: Date,
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'needs_repair', 'out_of_service'],
      default: 'good'
    },
    maintenanceDue: Date
  }],
  
  // Training & Development
  training: [{
    courseName: String,
    provider: String,
    completionDate: Date,
    expiryDate: Date,
    certificateUrl: String,
    score: Number,
    required: { type: Boolean, default: false },
    completed: { type: Boolean, default: false }
  }],
  
  // Emergency Contact
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    }
  },
  
  // Financial Information
  compensation: {
    hourlyRate: Number,
    salary: Number,
    payType: {
      type: String,
      enum: ['hourly', 'salary', 'commission', 'contract'],
      default: 'hourly'
    },
    bonusEligible: { type: Boolean, default: false },
    overtimeEligible: { type: Boolean, default: true }
  },
  
  // Notes & Comments
  notes: [{
    content: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ['general', 'performance', 'disciplinary', 'training', 'commendation'],
      default: 'general'
    },
    confidential: { type: Boolean, default: false }
  }],
  
  // Profile & Preferences
  profile: {
    avatar: String,
    bio: String,
    languages: [String],
    timezone: { type: String, default: 'UTC' },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
      jobAssignments: { type: Boolean, default: true },
      scheduleChanges: { type: Boolean, default: true }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
technicianSchema.index({ email: 1 });
technicianSchema.index({ employmentStatus: 1 });
technicianSchema.index({ 'availability.status': 1 });
technicianSchema.index({ specializations: 1 });
technicianSchema.index({ 'location.current.coordinates': '2dsphere' });
technicianSchema.index({ 'performance.customerRating': -1 });

// Virtual for full name
technicianSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for active certifications
technicianSchema.virtual('activeCertifications').get(function() {
  return this.certifications.filter(cert => cert.isActive && 
    (!cert.expiryDate || cert.expiryDate > new Date()));
});

// Virtual for expiring certifications (within 30 days)
technicianSchema.virtual('expiringCertifications').get(function() {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  return this.certifications.filter(cert => 
    cert.isActive && cert.expiryDate && 
    cert.expiryDate <= thirtyDaysFromNow && cert.expiryDate > new Date());
});

// Virtual for availability status
technicianSchema.virtual('isAvailable').get(function() {
  return this.employmentStatus === 'active' && 
         this.availability.status === 'available' &&
         this.availability.currentJobCount < this.availability.maxConcurrentJobs;
});

// Virtual for current workload percentage
technicianSchema.virtual('workloadPercentage').get(function() {
  return Math.round((this.availability.currentJobCount / this.availability.maxConcurrentJobs) * 100);
});

// Method to update location
technicianSchema.methods.updateLocation = function(longitude, latitude, address = '') {
  this.location.current.coordinates = [longitude, latitude];
  this.location.current.address = address;
  this.location.current.lastUpdated = new Date();
  return this.save();
};

// Method to update availability status
technicianSchema.methods.updateAvailability = function(status) {
  this.availability.status = status;
  return this.save();
};

// Method to assign job (increment current job count)
technicianSchema.methods.assignJob = function() {
  if (this.availability.currentJobCount >= this.availability.maxConcurrentJobs) {
    throw new Error('Technician has reached maximum concurrent jobs');
  }
  this.availability.currentJobCount += 1;
  return this.save();
};

// Method to complete job (decrement current job count)
technicianSchema.methods.completeJob = function() {
  if (this.availability.currentJobCount > 0) {
    this.availability.currentJobCount -= 1;
  }
  this.performance.totalJobsCompleted += 1;
  return this.save();
};

// Method to add certification
technicianSchema.methods.addCertification = function(certData) {
  this.certifications.push(certData);
  return this.save();
};

// Method to update certification status
technicianSchema.methods.updateCertification = function(certId, updates) {
  const cert = this.certifications.id(certId);
  if (cert) {
    Object.assign(cert, updates);
    return this.save();
  }
  throw new Error('Certification not found');
};

// Method to add training record
technicianSchema.methods.addTraining = function(trainingData) {
  this.training.push(trainingData);
  return this.save();
};

// Method to add note
technicianSchema.methods.addNote = function(content, author, type = 'general', confidential = false) {
  this.notes.push({
    content,
    author,
    type,
    confidential,
    date: new Date()
  });
  return this.save();
};

// Method to update performance metrics
technicianSchema.methods.updatePerformanceMetrics = function(metrics) {
  Object.assign(this.performance, metrics);
  return this.save();
};

// Method to check if technician has specialization
technicianSchema.methods.hasSpecialization = function(specialization) {
  return this.specializations.includes(specialization);
};

// Method to check if technician is working on a specific day
technicianSchema.methods.isWorkingOnDay = function(dayOfWeek) {
  const day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
  return this.availability.workingHours[day]?.working || false;
};

// Static method to find available technicians
technicianSchema.statics.findAvailable = function() {
  return this.find({
    employmentStatus: 'active',
    'availability.status': 'available',
    $expr: { $lt: ['$availability.currentJobCount', '$availability.maxConcurrentJobs'] }
  });
};

// Static method to find by specialization
technicianSchema.statics.findBySpecialization = function(specialization) {
  return this.find({
    specializations: specialization,
    employmentStatus: 'active'
  });
};

// Static method to find by employee ID
technicianSchema.statics.findByEmployeeId = function(employeeId) {
  return this.findOne({ employeeId: employeeId.toUpperCase() });
};

// Static method to find technicians in radius
technicianSchema.statics.findInRadius = function(longitude, latitude, radiusMiles) {
  return this.find({
    'location.current.coordinates': {
      $near: {
        $geometry: { type: 'Point', coordinates: [longitude, latitude] },
        $maxDistance: radiusMiles * 1609.34 // Convert miles to meters
      }
    },
    employmentStatus: 'active'
  });
};

// Static method to find technicians with expiring certifications
technicianSchema.statics.findWithExpiringCertifications = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    'certifications.isActive': true,
    'certifications.expiryDate': {
      $gte: new Date(),
      $lte: futureDate
    }
  });
};

export default mongoose.models.Technician || mongoose.model('Technician', technicianSchema);