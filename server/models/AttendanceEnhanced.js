const mongoose = require('mongoose');

const attendanceSessionSchema = new mongoose.Schema({
  checkInTime: {
    type: Date,
    required: true
  },
  checkOutTime: {
    type: Date,
    default: null
  },
  sessionHours: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

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
  sessions: [attendanceSessionSchema],
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

// Method to add a new check-in session
attendanceSchema.methods.addCheckIn = function(checkInTime, notes = '') {
  // Check if there's an active session (not checked out)
  const activeSession = this.sessions.find(session => session.isActive && !session.checkOutTime);
  
  if (activeSession) {
    // User is already checked in, don't create a new session
    return { success: false, message: 'Already checked in. Please check out first.' };
  }

  // Create new session
  const newSession = {
    checkInTime: checkInTime,
    notes: notes,
    isActive: true
  };

  this.sessions.push(newSession);
  this.calculateAttendanceStatus();
  
  return { success: true, session: newSession };
};

// Method to check out from the current active session
attendanceSchema.methods.addCheckOut = function(checkOutTime, notes = '') {
  // Find the active session (not checked out)
  const activeSession = this.sessions.find(session => session.isActive && !session.checkOutTime);
  
  if (!activeSession) {
    return { success: false, message: 'No active check-in found.' };
  }

  // Update the active session
  activeSession.checkOutTime = checkOutTime;
  activeSession.sessionHours = (checkOutTime - activeSession.checkInTime) / (1000 * 60 * 60);
  if (notes) {
    activeSession.notes = notes;
  }

  this.calculateAttendanceStatus();
  
  return { success: true, session: activeSession };
};

// Method to get the current active session
attendanceSchema.methods.getActiveSession = function() {
  return this.sessions.find(session => session.isActive && !session.checkOutTime);
};

// Method to calculate attendance status based on all sessions
attendanceSchema.methods.calculateAttendanceStatus = function() {
  if (this.sessions.length === 0) {
    this.status = 'absent';
    this.totalHours = 0;
    this.workingHours = 0;
    this.overtimeHours = 0;
    return;
  }

  // Calculate total hours from all sessions
  this.totalHours = this.sessions.reduce((total, session) => {
    return total + (session.sessionHours || 0);
  }, 0);

  // Get first check-in and last check-out times
  const firstSession = this.sessions[0];
  const lastCompletedSession = this.sessions.filter(s => s.checkOutTime).pop();

  if (firstSession) {
    const checkInTime = new Date(firstSession.checkInTime);
    const expectedCheckIn = new Date(this.date);
    const [expectedHour, expectedMinute] = this.expectedCheckIn.split(':');
    expectedCheckIn.setHours(parseInt(expectedHour), parseInt(expectedMinute), 0, 0);

    // Check if late check-in (after 9:00 AM)
    this.isLateCheckIn = checkInTime > expectedCheckIn;
  }

  if (lastCompletedSession) {
    const checkOutTime = new Date(lastCompletedSession.checkOutTime);
    const expectedCheckOut = new Date(this.date);
    const [expectedOutHour, expectedOutMinute] = this.expectedCheckOut.split(':');
    expectedCheckOut.setHours(parseInt(expectedOutHour), parseInt(expectedOutMinute), 0, 0);

    // Check if early check-out (before 6:00 PM)
    this.isEarlyCheckOut = checkOutTime < expectedCheckOut;
  }

  // Calculate working hours (excluding breaks)
  this.workingHours = this.totalHours - (this.totalBreakTime / 60);

  // Determine status based on working hours and timing
  const hasActiveSession = this.getActiveSession();
  
  if (hasActiveSession) {
    // User is currently checked in
    this.status = this.isLateCheckIn ? 'late' : 'present';
  } else if (this.workingHours >= 8 && !this.isLateCheckIn && !this.isEarlyCheckOut) {
    this.status = 'present';
  } else if (this.workingHours >= 4) {
    if (this.isLateCheckIn || this.isEarlyCheckOut) {
      this.status = 'late';
    } else {
      this.status = 'half_day';
    }
  } else if (this.workingHours > 0) {
    this.status = 'early_checkout';
  } else {
    this.status = 'absent';
  }

  // Calculate overtime (if worked more than 8 hours)
  this.overtimeHours = Math.max(0, this.workingHours - 8);
};

// Method to get formatted session data
attendanceSchema.methods.getFormattedSessions = function() {
  return this.sessions.map((session, index) => ({
    sessionNumber: index + 1,
    checkInTime: session.checkInTime ? session.checkInTime.toLocaleTimeString() : null,
    checkOutTime: session.checkOutTime ? session.checkOutTime.toLocaleTimeString() : null,
    sessionHours: session.sessionHours ? session.sessionHours.toFixed(2) : '0.00',
    notes: session.notes,
    isActive: session.isActive && !session.checkOutTime
  }));
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
    totalSessions: 0,
    averageSessionsPerDay: 0
  };

  let totalSessions = 0;

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
    totalSessions += record.sessions.length;
  });

  summary.totalSessions = totalSessions;
  summary.averageSessionsPerDay = attendanceRecords.length > 0 ? 
    (totalSessions / attendanceRecords.length).toFixed(2) : 0;

  return summary;
};

module.exports = mongoose.model('AttendanceEnhanced', attendanceSchema);
