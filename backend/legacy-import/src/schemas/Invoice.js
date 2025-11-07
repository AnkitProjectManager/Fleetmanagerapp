import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  // Invoice Identification
  invoiceNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  // Customer Information
  billTo: {
    fleetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fleet',
      required: [true, 'Fleet ID is required']
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer ID is required']
    },
    // Billing address (may differ from fleet address)
    billingAddress: {
      companyName: String,
      contactName: String,
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true, default: 'US' },
      email: String,
      phone: String
    }
  },
  
  // Invoice Dates
  issueDate: {
    type: Date,
    required: [true, 'Issue date is required'],
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  periodStart: Date,
  periodEnd: Date,
  
  // Invoice Status
  status: {
    type: String,
    enum: ['draft', 'pending', 'sent', 'paid', 'partial_paid', 'overdue', 'cancelled', 'refunded'],
    default: 'draft'
  },
  
  // Line Items
  lineItems: [{
    type: {
      type: String,
      enum: ['service', 'product', 'labor', 'parts', 'tax', 'fee', 'discount'],
      required: true
    },
    description: {
      type: String,
      required: [true, 'Item description is required'],
      trim: true
    },
    // Reference IDs
    serviceRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceRequest'
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle'
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service'
    },
    // Quantity and Pricing
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 1
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'fixed'
    },
    subtotal: {
      type: Number,
      required: true
    },
    // Tax Information
    taxable: {
      type: Boolean,
      default: true
    },
    taxRate: {
      type: Number,
      default: 0,
      min: [0, 'Tax rate cannot be negative'],
      max: [100, 'Tax rate cannot exceed 100%']
    },
    taxAmount: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    },
    // Additional Details
    date: { type: Date, default: Date.now },
    notes: String
  }],
  
  // Financial Summary
  summary: {
    subtotal: {
      type: Number,
      required: true,
      default: 0
    },
    totalDiscount: {
      type: Number,
      default: 0
    },
    totalTax: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0
    },
    amountPaid: {
      type: Number,
      default: 0
    },
    amountDue: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  // Tax Details
  taxBreakdown: [{
    name: String, // "Sales Tax", "VAT", etc.
    rate: Number,
    amount: Number,
    jurisdiction: String
  }],
  
  // Payment Information
  paymentTerms: {
    type: String,
    enum: ['immediate', 'net_15', 'net_30', 'net_45', 'net_60', 'custom'],
    default: 'net_30'
  },
  paymentMethods: [{
    type: String,
    enum: ['credit_card', 'bank_transfer', 'check', 'cash', 'ach', 'wire'],
    details: String,
    preferred: Boolean
  }],
  
  // Payment History
  payments: [{
    paymentId: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Payment amount cannot be negative']
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'bank_transfer', 'check', 'cash', 'ach', 'wire'],
      required: true
    },
    transactionId: String,
    reference: String,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed'
    },
    notes: String
  }],
  
  // Recurring Invoice Information
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'yearly']
    },
    interval: Number, // e.g., every 2 months
    nextInvoiceDate: Date,
    endDate: Date,
    remainingInvoices: Number
  },
  
  // Communication & Delivery
  communications: [{
    type: {
      type: String,
      enum: ['sent', 'reminder', 'overdue_notice', 'payment_received', 'note'],
      required: true
    },
    method: {
      type: String,
      enum: ['email', 'mail', 'phone', 'portal'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    recipient: String,
    subject: String,
    message: String,
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed'],
      default: 'sent'
    }
  }],
  
  // Attachments & Documents
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
  
  // Invoice Customization
  template: {
    templateId: String,
    logoUrl: String,
    companyInfo: {
      name: String,
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
      },
      phone: String,
      email: String,
      website: String,
      taxId: String
    },
    colors: {
      primary: String,
      secondary: String
    },
    notes: String,
    terms: String
  },
  
  // Analytics & Tracking
  analytics: {
    sentDate: Date,
    openedDate: Date,
    viewCount: { type: Number, default: 0 },
    downloadCount: { type: Number, default: 0 },
    paymentRemindersSent: { type: Number, default: 0 },
    lastReminderDate: Date
  },
  
  // Approval Workflow
  approval: {
    required: { type: Boolean, default: false },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedDate: Date,
    approvalComments: String
  },
  
  // Notes & References
  internalNotes: String,
  customerNotes: String,
  reference: String, // Customer's PO number, etc.
  
  // Integration & Export
  integration: {
    exportedToAccounting: { type: Boolean, default: false },
    accountingSystemId: String,
    exportDate: Date,
    syncStatus: {
      type: String,
      enum: ['pending', 'synced', 'error'],
      default: 'pending'
    },
    lastSyncDate: Date,
    syncErrors: [String]
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
invoiceSchema.index({ 'billTo.fleetId': 1 });
invoiceSchema.index({ 'billTo.customerId': 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ issueDate: -1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ 'summary.totalAmount': -1 });

// Compound indexes
invoiceSchema.index({ 'billTo.fleetId': 1, status: 1 });
invoiceSchema.index({ status: 1, dueDate: 1 });

// Virtual for overdue status
invoiceSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && 
         this.summary.amountDue > 0 && 
         !['paid', 'cancelled', 'refunded'].includes(this.status);
});

// Virtual for days overdue
invoiceSchema.virtual('daysOverdue').get(function() {
  if (!this.isOverdue) return 0;
  return Math.ceil((Date.now() - this.dueDate) / (1000 * 60 * 60 * 24));
});

// Virtual for payment status
invoiceSchema.virtual('paymentStatus').get(function() {
  if (this.summary.amountDue <= 0) return 'paid';
  if (this.summary.amountPaid > 0) return 'partial';
  if (this.isOverdue) return 'overdue';
  return 'pending';
});

// Virtual for age in days
invoiceSchema.virtual('ageInDays').get(function() {
  return Math.ceil((Date.now() - this.issueDate) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to generate invoice number
invoiceSchema.pre('validate', async function(next) {
  if (this.isNew && !this.invoiceNumber) {
    try {
      const year = new Date().getFullYear();
      // Find the last invoice for the current year to determine the next number
      const lastInvoice = await this.constructor.findOne({ invoiceNumber: new RegExp(`^INV-${year}-`) })
        .sort({ invoiceNumber: -1 });

      let nextNumber = 1;
      if (lastInvoice && lastInvoice.invoiceNumber) {
        const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2], 10);
        nextNumber = lastNumber + 1;
      }
      
      this.invoiceNumber = `INV-${year}-${String(nextNumber).padStart(6, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Pre-save middleware to calculate totals
invoiceSchema.pre('save', function(next) {
  // Calculate line item totals
  this.lineItems.forEach(item => {
    // Calculate subtotal after discount
    let subtotal = item.quantity * item.unitPrice;
    if (item.discountType === 'percentage') {
      subtotal -= (subtotal * item.discount / 100);
    } else {
      subtotal -= item.discount;
    }
    item.subtotal = Math.max(0, subtotal);
    
    // Calculate tax
    if (item.taxable && item.taxRate > 0) {
      item.taxAmount = item.subtotal * (item.taxRate / 100);
    } else {
      item.taxAmount = 0;
    }
    
    // Calculate total
    item.total = item.subtotal + item.taxAmount;
  });
  
  // Calculate summary totals
  this.summary.subtotal = this.lineItems.reduce((sum, item) => sum + item.subtotal, 0);
  this.summary.totalDiscount = this.lineItems.reduce((sum, item) => {
    if (item.discountType === 'percentage') {
      return sum + (item.quantity * item.unitPrice * item.discount / 100);
    }
    return sum + item.discount;
  }, 0);
  this.summary.totalTax = this.lineItems.reduce((sum, item) => sum + item.taxAmount, 0);
  this.summary.totalAmount = this.summary.subtotal + this.summary.totalTax;
  this.summary.amountDue = this.summary.totalAmount - this.summary.amountPaid;
  
  // Set default due date if not provided
  if (!this.dueDate) {
    const daysToAdd = {
      'immediate': 0,
      'net_15': 15,
      'net_30': 30,
      'net_45': 45,
      'net_60': 60,
      'custom': 30
    }[this.paymentTerms] || 30;
    
    this.dueDate = new Date(this.issueDate);
    this.dueDate.setDate(this.dueDate.getDate() + daysToAdd);
  }
  
  next();
});

// Method to add line item
invoiceSchema.methods.addLineItem = function(itemData) {
  this.lineItems.push(itemData);
  return this.save();
};

// Method to remove line item
invoiceSchema.methods.removeLineItem = function(itemId) {
  this.lineItems.pull(itemId);
  return this.save();
};

// Method to add payment
invoiceSchema.methods.addPayment = function(paymentData) {
  this.payments.push(paymentData);
  this.summary.amountPaid = this.payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  
  // Update status based on payment
  if (this.summary.amountDue <= 0) {
    this.status = 'paid';
  } else if (this.summary.amountPaid > 0) {
    this.status = 'partial_paid';
  }
  
  return this.save();
};

// Method to send invoice
invoiceSchema.methods.sendInvoice = function(method = 'email', recipient, sentBy) {
  this.status = 'sent';
  this.analytics.sentDate = new Date();
  
  this.communications.push({
    type: 'sent',
    method,
    recipient,
    sentBy,
    date: new Date()
  });
  
  return this.save();
};

// Method to mark as viewed
invoiceSchema.methods.markAsViewed = function() {
  this.analytics.viewCount += 1;
  if (!this.analytics.openedDate) {
    this.analytics.openedDate = new Date();
  }
  return this.save();
};

// Method to send payment reminder
invoiceSchema.methods.sendPaymentReminder = function(method = 'email', recipient, sentBy) {
  this.analytics.paymentRemindersSent += 1;
  this.analytics.lastReminderDate = new Date();
  
  this.communications.push({
    type: 'reminder',
    method,
    recipient,
    sentBy,
    date: new Date()
  });
  
  return this.save();
};

// Static method to find by invoice number
invoiceSchema.statics.findByInvoiceNumber = function(invoiceNumber) {
  return this.findOne({ invoiceNumber });
};

// Static method to find overdue invoices
invoiceSchema.statics.findOverdue = function() {
  return this.find({
    dueDate: { $lt: new Date() },
    'summary.amountDue': { $gt: 0 },
    status: { $nin: ['paid', 'cancelled', 'refunded'] }
  });
};

// Static method to find by fleet
invoiceSchema.statics.findByFleet = function(fleetId) {
  return this.find({ 'billTo.fleetId': fleetId }).sort({ issueDate: -1 });
};

// Static method to find by customer
invoiceSchema.statics.findByCustomer = function(customerId) {
  return this.find({ 'billTo.customerId': customerId }).sort({ issueDate: -1 });
};

// Static method to find by date range
invoiceSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    issueDate: { $gte: startDate, $lte: endDate }
  }).sort({ issueDate: -1 });
};

// Static method to get revenue summary
invoiceSchema.statics.getRevenueSummary = async function(startDate, endDate) {
  const pipeline = [
    {
      $match: {
        issueDate: { $gte: startDate, $lte: endDate },
        status: { $nin: ['cancelled', 'refunded'] }
      }
    },
    {
      $group: {
        _id: null,
        totalInvoices: { $sum: 1 },
        totalRevenue: { $sum: '$summary.totalAmount' },
        totalPaid: { $sum: '$summary.amountPaid' },
        totalOutstanding: { $sum: '$summary.amountDue' }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalInvoices: 0,
    totalRevenue: 0,
    totalPaid: 0,
    totalOutstanding: 0
  };
};

export default mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);