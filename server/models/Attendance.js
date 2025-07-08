const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkInTime: {
    type: Date,
    default: null
  },
  checkOutTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['present', 'late', 'half_day', 'absent', 'early_checkout'],
    default: 'absent'
  },
  totalHours: {
    type: Number,
    default: 0
  },
  isLateCheckIn: {
    type: Boolean,
    default: false
  },
  isEarlyCheckOut: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    default: ''
  },
  // Office hours configuration
  expectedCheckIn: {
    type: String,
    default: '09:00' // 9:00 AM
  },
  expectedCheckOut: {
    type: String,
    default: '18:00' // 6:00 PM
  },
  // Break times tracking
  breaks: [{
    breakOut: {
      type: Date,
      default: null
    },
    breakIn: {
      type: Date,
      default: null
    },
    duration: {
      type: Number, // in minutes
      default: 0
    }
  }],
  totalBreakTime: {
    type: Number, // in minutes
    default: 0
  },
  // Calculated fields
  workingHours: {
    type: Number, // actual working hours excluding breaks
    default: 0
  },
  overtimeHours: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ userId: 1 });

// Method to calculate attendance status
attendanceSchema.methods.calculateAttendanceStatus = function() {
  if (!this.checkInTime) {
    this.status = 'absent';
    return;
  }

  const checkInTime = new Date(this.checkInTime);
  const expectedCheckIn = new Date(this.date);
  const [expectedHour, expectedMinute] = this.expectedCheckIn.split(':');
  expectedCheckIn.setHours(parseInt(expectedHour), parseInt(expectedMinute), 0, 0);

  // Check if late check-in (after 9:00 AM)
  this.isLateCheckIn = checkInTime > expectedCheckIn;

  if (this.checkOutTime) {
    const checkOutTime = new Date(this.checkOutTime);
    const expectedCheckOut = new Date(this.date);
    const [expectedOutHour, expectedOutMinute] = this.expectedCheckOut.split(':');
    expectedCheckOut.setHours(parseInt(expectedOutHour), parseInt(expectedOutMinute), 0, 0);

    // Check if early check-out (before 6:00 PM)
    this.isEarlyCheckOut = checkOutTime < expectedCheckOut;

    // Calculate total hours
    const totalMilliseconds = checkOutTime - checkInTime;
    this.totalHours = totalMilliseconds / (1000 * 60 * 60); // Convert to hours

    // Calculate working hours (excluding breaks)
    this.workingHours = this.totalHours - (this.totalBreakTime / 60);

    // Determine status based on working hours and timing
    if (this.workingHours >= 8 && !this.isLateCheckIn && !this.isEarlyCheckOut) {
      this.status = 'present';
    } else if (this.workingHours >= 4) {
      if (this.isLateCheckIn || this.isEarlyCheckOut) {
        this.status = 'late';
      } else {
        this.status = 'half_day';
      }
    } else {
      this.status = 'early_checkout';
    }

    // Calculate overtime (if worked more than 8 hours)
    this.overtimeHours = Math.max(0, this.workingHours - 8);
  } else {
    // Only checked in, no checkout yet
    this.status = this.isLateCheckIn ? 'late' : 'present';
  }
};

// Static method to get attendance for a date range
attendanceSchema.statics.getAttendanceReport = async function(userId, startDate, endDate) {
  return await this.find({
    userId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: -1 });
};

// Static method to get monthly attendance summary
attendanceSchema.statics.getMonthlyAttendanceSummary = async function(userId, year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  const attendanceRecords = await this.find({
    userId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  });

  const summary = {
    totalDays: attendanceRecords.length,
    presentDays: 0,
    lateDays: 0,
    halfDays: 0,
    absentDays: 0,
    totalWorkingHours: 0,
    totalOvertimeHours: 0,
    averageCheckInTime: null,
    averageCheckOutTime: null
  };

  let checkInTimes = [];
  let checkOutTimes = [];

  attendanceRecords.forEach(record => {
    switch (record.status) {
      case 'present':
        summary.presentDays++;
        break;
      case 'late':
        summary.lateDays++;
        break;
      case 'half_day':
        summary.halfDays++;
        break;
      case 'absent':
        summary.absentDays++;
        break;
    }

    summary.totalWorkingHours += record.workingHours || 0;
    summary.totalOvertimeHours += record.overtimeHours || 0;

    if (record.checkInTime) {
      checkInTimes.push(new Date(record.checkInTime));
    }
    if (record.checkOutTime) {
      checkOutTimes.push(new Date(record.checkOutTime));
    }
  });

  // Calculate average times
  if (checkInTimes.length > 0) {
    const avgCheckInMs = checkInTimes.reduce((sum, time) => sum + time.getTime(), 0) / checkInTimes.length;
    summary.averageCheckInTime = new Date(avgCheckInMs);
  }

  if (checkOutTimes.length > 0) {
    const avgCheckOutMs = checkOutTimes.reduce((sum, time) => sum + time.getTime(), 0) / checkOutTimes.length;
    summary.averageCheckOutTime = new Date(avgCheckOutMs);
  }

  return summary;
};

module.exports = mongoose.model('Attendance', attendanceSchema);
