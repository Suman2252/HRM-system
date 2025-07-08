const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  payPeriod: {
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true
    }
  },
  // Basic salary components
  basicSalary: {
    type: Number,
    required: true,
    min: 0
  },
  // Allowances
  allowances: {
    hra: { type: Number, default: 0 }, // House Rent Allowance
    da: { type: Number, default: 0 },  // Dearness Allowance
    ta: { type: Number, default: 0 },  // Travel Allowance
    medical: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    overtime: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  // Deductions
  deductions: {
    pf: { type: Number, default: 0 },     // Provident Fund
    esi: { type: Number, default: 0 },    // Employee State Insurance
    tax: { type: Number, default: 0 },    // Income Tax
    loan: { type: Number, default: 0 },   // Loan deduction
    advance: { type: Number, default: 0 }, // Advance deduction
    other: { type: Number, default: 0 }
  },
  // Attendance data
  attendanceData: {
    totalWorkingDays: { type: Number, default: 0 },
    actualWorkingDays: { type: Number, default: 0 },
    presentDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    halfDays: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },
    lateComingDays: { type: Number, default: 0 },
    earlyGoingDays: { type: Number, default: 0 }
  },
  // Leave data
  leaveData: {
    paidLeaves: { type: Number, default: 0 },
    unpaidLeaves: { type: Number, default: 0 },
    sickLeaves: { type: Number, default: 0 },
    casualLeaves: { type: Number, default: 0 }
  },
  // Calculated amounts
  grossSalary: {
    type: Number,
    default: 0
  },
  totalAllowances: {
    type: Number,
    default: 0
  },
  totalDeductions: {
    type: Number,
    default: 0
  },
  netSalary: {
    type: Number,
    default: 0
  },
  // Payment details
  paymentStatus: {
    type: String,
    enum: ['pending', 'processed', 'paid', 'failed'],
    default: 'pending'
  },
  paymentDate: {
    type: Date,
    default: null
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'cash', 'cheque'],
    default: 'bank_transfer'
  },
  paymentReference: {
    type: String,
    default: null
  },
  // Processing details
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  generatedDate: {
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
  // Additional details
  remarks: {
    type: String,
    default: ''
  },
  payslipGenerated: {
    type: Boolean,
    default: false
  },
  payslipPath: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Compound index for unique payroll per employee per month
payrollSchema.index({ employeeId: 1, 'payPeriod.month': 1, 'payPeriod.year': 1 }, { unique: true });
payrollSchema.index({ paymentStatus: 1 });
payrollSchema.index({ generatedDate: 1 });

// Pre-save middleware to calculate amounts
payrollSchema.pre('save', function(next) {
  // Calculate total allowances
  this.totalAllowances = Object.values(this.allowances).reduce((sum, amount) => sum + (amount || 0), 0);
  
  // Calculate total deductions
  this.totalDeductions = Object.values(this.deductions).reduce((sum, amount) => sum + (amount || 0), 0);
  
  // Calculate gross salary
  this.grossSalary = this.basicSalary + this.totalAllowances;
  
  // Calculate net salary
  this.netSalary = this.grossSalary - this.totalDeductions;
  
  next();
});

// Static method to calculate payroll for an employee
payrollSchema.statics.calculatePayroll = async function(employeeId, month, year) {
  const User = mongoose.model('User');
  const Attendance = mongoose.model('AttendanceEnhanced');
  const Leave = mongoose.model('Leave');
  
  // Get employee details
  const employee = await User.findById(employeeId);
  if (!employee) {
    throw new Error('Employee not found');
  }
  
  // Get attendance data for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  const attendanceRecords = await Attendance.find({
    userId: employeeId,
    date: { $gte: startDate, $lte: endDate }
  });
  
  // Get leave data for the month
  const leaveRecords = await Leave.find({
    employeeId,
    status: 'approved',
    startDate: { $lte: endDate },
    endDate: { $gte: startDate }
  });
  
  // Calculate working days in month
  const totalWorkingDays = this.getWorkingDaysInMonth(year, month - 1);
  
  // Calculate attendance metrics
  const presentDays = attendanceRecords.filter(r => r.status === 'present').length;
  const absentDays = attendanceRecords.filter(r => r.status === 'absent').length;
  const halfDays = attendanceRecords.filter(r => r.status === 'half_day').length;
  const lateComingDays = attendanceRecords.filter(r => r.isLateCheckIn).length;
  const earlyGoingDays = attendanceRecords.filter(r => r.isEarlyCheckOut).length;
  const overtimeHours = attendanceRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);
  
  // Calculate leave metrics
  const paidLeaves = leaveRecords.filter(l => ['annual', 'sick', 'personal'].includes(l.leaveType))
    .reduce((sum, l) => sum + l.totalDays, 0);
  const unpaidLeaves = leaveRecords.filter(l => l.leaveType === 'unpaid')
    .reduce((sum, l) => sum + l.totalDays, 0);
  
  // Calculate basic salary (pro-rated for actual working days)
  const actualWorkingDays = presentDays + (halfDays * 0.5) + paidLeaves;
  const basicSalary = (employee.salary || 0) * (actualWorkingDays / totalWorkingDays);
  
  // Calculate allowances (as percentage of basic salary)
  const allowances = {
    hra: basicSalary * 0.4, // 40% of basic salary
    da: basicSalary * 0.1,  // 10% of basic salary
    ta: 2000, // Fixed amount
    medical: 1500, // Fixed amount
    bonus: 0,
    overtime: overtimeHours * 200, // Rs. 200 per hour
    other: 0
  };
  
  // Calculate deductions
  const grossSalary = basicSalary + Object.values(allowances).reduce((sum, amount) => sum + amount, 0);
  const deductions = {
    pf: basicSalary * 0.12, // 12% of basic salary
    esi: grossSalary * 0.0175, // 1.75% of gross salary (if applicable)
    tax: this.calculateIncomeTax(grossSalary * 12), // Annual tax / 12
    loan: 0,
    advance: 0,
    other: 0
  };
  
  return {
    employeeId,
    payPeriod: { month, year },
    basicSalary,
    allowances,
    deductions,
    attendanceData: {
      totalWorkingDays,
      actualWorkingDays,
      presentDays,
      absentDays,
      halfDays,
      overtimeHours,
      lateComingDays,
      earlyGoingDays
    },
    leaveData: {
      paidLeaves,
      unpaidLeaves,
      sickLeaves: leaveRecords.filter(l => l.leaveType === 'sick').reduce((sum, l) => sum + l.totalDays, 0),
      casualLeaves: leaveRecords.filter(l => l.leaveType === 'personal').reduce((sum, l) => sum + l.totalDays, 0)
    }
  };
};

// Helper method to get working days in a month
payrollSchema.statics.getWorkingDaysInMonth = function(year, month) {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  let workingDays = 0;
  
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude weekends
      workingDays++;
    }
  }
  
  return workingDays;
};

// Helper method to calculate income tax (simplified)
payrollSchema.statics.calculateIncomeTax = function(annualSalary) {
  // Simplified tax calculation (Indian tax slabs for FY 2023-24)
  let tax = 0;
  
  if (annualSalary <= 250000) {
    tax = 0;
  } else if (annualSalary <= 500000) {
    tax = (annualSalary - 250000) * 0.05;
  } else if (annualSalary <= 1000000) {
    tax = 12500 + (annualSalary - 500000) * 0.2;
  } else {
    tax = 112500 + (annualSalary - 1000000) * 0.3;
  }
  
  return tax / 12; // Monthly tax
};

// Static method to generate payroll for multiple employees
payrollSchema.statics.generateBulkPayroll = async function(employeeIds, month, year, generatedBy) {
  const results = [];
  
  for (const employeeId of employeeIds) {
    try {
      const payrollData = await this.calculatePayroll(employeeId, month, year);
      payrollData.generatedBy = generatedBy;
      
      // Check if payroll already exists
      const existingPayroll = await this.findOne({
        employeeId,
        'payPeriod.month': month,
        'payPeriod.year': year
      });
      
      if (existingPayroll) {
        // Update existing payroll
        Object.assign(existingPayroll, payrollData);
        await existingPayroll.save();
        results.push({ employeeId, status: 'updated', payroll: existingPayroll });
      } else {
        // Create new payroll
        const newPayroll = new this(payrollData);
        await newPayroll.save();
        results.push({ employeeId, status: 'created', payroll: newPayroll });
      }
    } catch (error) {
      results.push({ employeeId, status: 'error', error: error.message });
    }
  }
  
  return results;
};

module.exports = mongoose.model('Payroll', payrollSchema);
