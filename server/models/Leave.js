const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  leaveType: {
    type: String,
    enum: ['annual', 'sick', 'personal', 'maternity', 'paternity', 'emergency', 'unpaid'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalDays: {
    type: Number,
    required: true
  },
  isHalfDay: {
    type: Boolean,
    default: false
  },
  halfDayPeriod: {
    type: String,
    enum: ['morning', 'afternoon'],
    default: null
  },
  reason: {
    type: String,
    required: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedDate: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  // Leave balance tracking
  balanceDeducted: {
    type: Boolean,
    default: false
  },
  // Emergency contact during leave
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  // Work handover details
  handoverTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  handoverNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
leaveSchema.index({ employeeId: 1, startDate: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ leaveType: 1 });
leaveSchema.index({ appliedDate: 1 });

// Calculate total days before saving
leaveSchema.pre('save', function(next) {
  if (this.isModified('startDate') || this.isModified('endDate') || this.isModified('isHalfDay')) {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    
    // Calculate business days (excluding weekends)
    let totalDays = 0;
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        totalDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // If it's a half day, count as 0.5
    if (this.isHalfDay && totalDays === 1) {
      this.totalDays = 0.5;
    } else {
      this.totalDays = totalDays;
    }
  }
  next();
});

// Static method to get leave balance for an employee
leaveSchema.statics.getLeaveBalance = async function(employeeId, year = new Date().getFullYear()) {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31);
  
  const leaveRecords = await this.find({
    employeeId,
    status: 'approved',
    startDate: { $gte: startOfYear, $lte: endOfYear }
  });
  
  const balance = {
    annual: { total: 25, used: 0, remaining: 25 },
    sick: { total: 12, used: 0, remaining: 12 },
    personal: { total: 5, used: 0, remaining: 5 },
    maternity: { total: 90, used: 0, remaining: 90 },
    paternity: { total: 15, used: 0, remaining: 15 },
    emergency: { total: 3, used: 0, remaining: 3 }
  };
  
  leaveRecords.forEach(leave => {
    if (balance[leave.leaveType]) {
      balance[leave.leaveType].used += leave.totalDays;
      balance[leave.leaveType].remaining = Math.max(0, balance[leave.leaveType].total - balance[leave.leaveType].used);
    }
  });
  
  return balance;
};

// Static method to check leave conflicts
leaveSchema.statics.checkConflicts = async function(employeeId, startDate, endDate, excludeLeaveId = null) {
  const query = {
    employeeId,
    status: { $in: ['pending', 'approved'] },
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
    ]
  };
  
  if (excludeLeaveId) {
    query._id = { $ne: excludeLeaveId };
  }
  
  return await this.find(query);
};

module.exports = mongoose.model('Leave', leaveSchema);
