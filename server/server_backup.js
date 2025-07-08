const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models and services
const Employee = require('./models/Employee');
const User = require('./models/User');
const emailService = require('./services/emailService');
const realEmailService = require('./services/realEmailService');
const PasswordGenerator = require('./utils/passwordGenerator');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrm_system';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize default admin and HR users
const initializeDefaultUsers = async () => {
  try {
    // Check if admin user exists
    const adminExists = await User.findOne({ email: 'admin@hrm.com' });
    if (!adminExists) {
      const adminUser = new User({
        email: 'admin@hrm.com',
        password: 'admin123',
        role: 'admin',
        createdBy: 'system'
      });
      await adminUser.save();
      console.log('✅ Default admin user created');
    }

    // Check if HR manager exists
    const hrExists = await User.findOne({ email: 'hr@hrm.com' });
    if (!hrExists) {
      const hrUser = new User({
        email: 'hr@hrm.com',
        password: 'hr123456',
        role: 'hr_manager',
        createdBy: 'system'
      });
      await hrUser.save();
      console.log('✅ Default HR manager created');
    }
  } catch (error) {
    console.error('❌ Error creating default users:', error);
  }
};

// Initialize default users after MongoDB connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('📦 Connected to MongoDB');
  initializeDefaultUsers();
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  console.log('⚠️  Running without database - employee data will not persist');
});

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id || user.id, 
      email: user.email, 
      role: user.role,
      employeeId: user.employeeId,
      tempAccess: user.tempAccess || false
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    let { email, password } = req.body;

    // Normalize email to lowercase and trim whitespace
    email = email.trim().toLowerCase();
    password = password.trim();

    // Find user by normalized email
    const user = await User.findOne({ email }).populate('employeeId');
    if (!user) {
      console.log(`Login failed: User not found for email ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log(`Login failed: Invalid password for user ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Remove password change requirement - allow direct login
    // const isFirstLogin = !user.lastLogin;
    // if (isFirstLogin) {
    //   return res.status(200).json({
    //     requirePasswordChange: true,
    //     message: 'Welcome! Please change your temporary password to continue',
    //     tempToken: generateToken({ ...user.toObject(), tempAccess: true }),
    //     isFirstLogin: true
    //   });
    // }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user);

    // Prepare user data
    const userData = {
      id: user._id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      lastLogin: user.lastLogin
    };

    // If user has an associated employee record, include employee details
    if (user.employeeId) {
      userData.employee = {
        firstName: user.employeeId.firstName,
        lastName: user.employeeId.lastName,
        department: user.employeeId.department,
        designation: user.employeeId.designation
      };
    }

    res.json({
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user endpoint
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('employeeId');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare user data
    const userData = {
      id: user._id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
      dateOfBirth: user.dateOfBirth,
      bio: user.bio,
      profileImage: user.profileImage,
      employeeCode: user.employeeCode,
      bloodGroup: user.bloodGroup,
      personalInfo: user.personalInfo,
      familyInfo: user.familyInfo,
      lastLogin: user.lastLogin
    };

    // If user has an associated employee record, include employee details
    if (user.employeeId) {
      userData.employee = {
        firstName: user.employeeId.firstName,
        lastName: user.employeeId.lastName,
        department: user.employeeId.department,
        designation: user.employeeId.designation
      };
    }

    res.json({
      data: {
        user: userData
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Register endpoint (disabled as per requirements)
app.post('/api/auth/register', (req, res) => {
  res.status(403).json({ message: 'Registration is disabled' });
});

// Profile update endpoint
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { 
      firstName, lastName, phone, address, dateOfBirth, bio, profileImage,
      employeeCode, bloodGroup, personalInfo, familyInfo
    } = req.body;

    // Find and update user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields with proper validation
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (bio !== undefined) user.bio = bio;
    if (profileImage !== undefined) {
      // Validate profile image size (limit to 5MB base64)
      if (profileImage && profileImage.length > 7000000) { // ~5MB in base64
        return res.status(400).json({ message: 'Profile image too large. Please use an image smaller than 5MB.' });
      }
      user.profileImage = profileImage;
    }
    if (employeeCode !== undefined) user.employeeCode = employeeCode;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (personalInfo !== undefined) user.personalInfo = personalInfo;
    if (familyInfo !== undefined) user.familyInfo = familyInfo;

    await user.save();

    // Return updated user data
    const userData = {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
      dateOfBirth: user.dateOfBirth,
      bio: user.bio,
      profileImage: user.profileImage,
      employeeCode: user.employeeCode,
      bloodGroup: user.bloodGroup,
      personalInfo: user.personalInfo,
      familyInfo: user.familyInfo,
      lastLogin: user.lastLogin
    };

    res.json({
      message: 'Profile updated successfully',
      data: userData
    });
  } catch (error) {
    console.error('Profile update error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: Object.values(error.errors).map(e => e.message)
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate field value' });
    }
    
    // Handle document size limit error
    if (error.message && error.message.includes('BSONObj size')) {
      return res.status(400).json({ message: 'Profile data too large. Please reduce image size.' });
    }
    
    res.status(500).json({ 
      message: 'Error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Change password endpoint
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If it's first login with temp token, don't check current password
    if (!req.user.tempAccess) {
      // Verify current password
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = generateToken(user);

    res.json({
      message: 'Password changed successfully',
      token
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
});

// Attendance endpoints
app.post('/api/attendance/checkin', authenticateToken, async (req, res) => {
  try {
    const { location, notes } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    // Mock attendance check-in
    const attendanceRecord = {
      id: Date.now(),
      employeeId: req.user.employeeId,
      date: today,
      checkIn: new Date().toISOString(),
      location: location || 'Office',
      notes: notes || '',
      status: 'present'
    };

    res.json({
      message: 'Checked in successfully',
      data: attendanceRecord
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Error recording check-in' });
  }
});

app.post('/api/attendance/checkout', authenticateToken, async (req, res) => {
  try {
    const { notes } = req.body;
    const now = new Date().toISOString();
    
    // Mock attendance check-out
    const attendanceRecord = {
      id: Date.now(),
      employeeId: req.user.employeeId,
      checkOut: now,
      notes: notes || '',
      totalHours: '8:30' // Mock calculation
    };

    res.json({
      message: 'Checked out successfully',
      data: attendanceRecord
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: 'Error recording check-out' });
  }
});

app.get('/api/attendance', authenticateToken, (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Mock attendance data
    const mockAttendance = [
      {
        id: 1,
        date: '2024-01-15',
        checkIn: '09:00:00',
        checkOut: '17:30:00',
        totalHours: '8:30',
        status: 'present',
        location: 'Office'
      },
      {
        id: 2,
        date: '2024-01-14',
        checkIn: '09:15:00',
        checkOut: '17:45:00',
        totalHours: '8:30',
        status: 'present',
        location: 'Office'
      },
      {
        id: 3,
        date: '2024-01-13',
        status: 'absent',
        reason: 'Sick leave'
      }
    ];

    res.json({ 
      data: mockAttendance,
      summary: {
        totalDays: 3,
        presentDays: 2,
        absentDays: 1,
        totalHours: '17:00'
      }
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Error fetching attendance data' });
  }
});

app.get('/api/attendance/report', authenticateToken, (req, res) => {
  try {
    // Check if user has admin or HR manager role
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') {
      return res.status(403).json({ message: 'Not authorized to view attendance reports' });
    }

    const { month, year, department } = req.query;
    
    // Mock attendance report data
    const mockReport = {
      period: `${month || 'January'} ${year || '2024'}`,
      department: department || 'All Departments',
      summary: {
        totalEmployees: 25,
        averageAttendance: 92.5,
        totalWorkingDays: 22,
        totalPresent: 510,
        totalAbsent: 40
      },
      employees: [
        {
          id: 1,
          name: 'John Doe',
          department: 'IT',
          presentDays: 20,
          absentDays: 2,
          attendanceRate: 90.9
        },
        {
          id: 2,
          name: 'Jane Smith',
          department: 'HR',
          presentDays: 22,
          absentDays: 0,
          attendanceRate: 100
        }
      ]
    };

    res.json({ data: mockReport });
  } catch (error) {
    console.error('Get attendance report error:', error);
    res.status(500).json({ message: 'Error fetching attendance report' });
  }
});

// Leave endpoints
app.post('/api/leave/request', authenticateToken, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason, isHalfDay } = req.body;
    
    // Mock leave request
    const leaveRequest = {
      id: Date.now(),
      employeeId: req.user.employeeId,
      leaveType,
      startDate,
      endDate,
      reason,
      isHalfDay: isHalfDay || false,
      status: 'pending',
      appliedDate: new Date().toISOString(),
      approvedBy: null,
      approvedDate: null
    };

    res.json({
      message: 'Leave request submitted successfully',
      data: leaveRequest
    });
  } catch (error) {
    console.error('Leave request error:', error);
    res.status(500).json({ message: 'Error submitting leave request' });
  }
});

app.get('/api/leave', authenticateToken, (req, res) => {
  try {
    // Mock leave data
    const mockLeaves = [
      {
        id: 1,
        leaveType: 'Annual Leave',
        startDate: '2024-01-20',
        endDate: '2024-01-22',
        days: 3,
        reason: 'Family vacation',
        status: 'approved',
        appliedDate: '2024-01-10',
        approvedBy: 'HR Manager'
      },
      {
        id: 2,
        leaveType: 'Sick Leave',
        startDate: '2024-01-15',
        endDate: '2024-01-15',
        days: 1,
        reason: 'Medical appointment',
        status: 'pending',
        appliedDate: '2024-01-14'
      }
    ];

    res.json({ data: mockLeaves });
  } catch (error) {
    console.error('Get leave error:', error);
    res.status(500).json({ message: 'Error fetching leave data' });
  }
});

app.get('/api/leave/balance', authenticateToken, (req, res) => {
  try {
    // Mock leave balance
    const leaveBalance = {
      annualLeave: {
        total: 25,
        used: 8,
        remaining: 17
      },
      sickLeave: {
        total: 12,
        used: 3,
        remaining: 9
      },
      personalLeave: {
        total: 5,
        used: 1,
        remaining: 4
      }
    };

    res.json({ data: leaveBalance });
  } catch (error) {
    console.error('Get leave balance error:', error);
    res.status(500).json({ message: 'Error fetching leave balance' });
  }
});

// Payroll endpoints
app.post('/api/payroll/generate', authenticateToken, async (req, res) => {
  try {
    // Check if user has admin or HR manager role
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') {
      return res.status(403).json({ message: 'Not authorized to generate payroll' });
    }

    const { month, year, employeeIds } = req.body;
    
    // Mock payroll generation
    const payrollBatch = {
      id: Date.now(),
      month,
      year,
      generatedBy: req.user.email,
      generatedDate: new Date().toISOString(),
      employeeCount: employeeIds ? employeeIds.length : 25,
      totalAmount: 125000,
      status: 'generated'
    };

    res.json({
      message: 'Payroll generated successfully',
      data: payrollBatch
    });
  } catch (error) {
    console.error('Payroll generation error:', error);
    res.status(500).json({ message: 'Error generating payroll' });
  }
});

app.get('/api/payroll', authenticateToken, (req, res) => {
  try {
    // Mock payroll data
    const mockPayroll = [
      {
        id: 1,
        month: 'January',
        year: 2024,
        basicSalary: 5000,
        allowances: 1000,
        deductions: 500,
        netSalary: 5500,
        status: 'paid',
        payDate: '2024-01-31'
      },
      {
        id: 2,
        month: 'December',
        year: 2023,
        basicSalary: 5000,
        allowances: 1200,
        deductions: 450,
        netSalary: 5750,
        status: 'paid',
        payDate: '2023-12-31'
      }
    ];

    res.json({ data: mockPayroll });
  } catch (error) {
    console.error('Get payroll error:', error);
    res.status(500).json({ message: 'Error fetching payroll data' });
  }
});

app.get('/api/payroll/history', authenticateToken, (req, res) => {
  try {
    const { year } = req.query;
    
    // Mock payroll history
    const mockHistory = [
      {
        id: 1,
        month: 'January 2024',
        employeeCount: 25,
        totalAmount: 125000,
        generatedDate: '2024-01-31',
        status: 'completed'
      },
      {
        id: 2,
        month: 'December 2023',
        employeeCount: 24,
        totalAmount: 120000,
        generatedDate: '2023-12-31',
        status: 'completed'
      }
    ];

    res.json({ data: mockHistory });
  } catch (error) {
    console.error('Get payroll history error:', error);
    res.status(500).json({ message: 'Error fetching payroll history' });
  }
});

// Analytics endpoints
app.get('/api/analytics/employee/demographics', authenticateToken, (req, res) => {
  try {
    // Check if user has admin or HR manager role
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') {
      return res.status(403).json({ message: 'Not authorized to view analytics' });
    }

    // Mock demographics data
    const demographics = {
      totalEmployees: 156,
      growthRate: 12,
      retentionRate: 87,
      retentionTrend: 5,
      departments: [
        { name: 'Engineering', count: 45 },
        { name: 'Sales', count: 32 },
        { name: 'Marketing', count: 28 },
        { name: 'HR', count: 15 },
        { name: 'Finance', count: 20 },
        { name: 'Operations', count: 16 }
      ],
      ageGroups: [
        { range: '20-25', count: 25, percentage: 16 },
        { range: '26-30', count: 48, percentage: 31 },
        { range: '31-35', count: 42, percentage: 27 },
        { range: '36-40', count: 28, percentage: 18 },
        { range: '41+', count: 13, percentage: 8 }
      ],
      gender: [
        { type: 'Male', count: 89, percentage: 57 },
        { type: 'Female', count: 67, percentage: 43 }
      ],
      experience: [
        { range: '0-2 years', count: 35, percentage: 22 },
        { range: '3-5 years', count: 52, percentage: 33 },
        { range: '6-10 years', count: 45, percentage: 29 },
        { range: '10+ years', count: 24, percentage: 16 }
      ]
    };

    res.json({ data: demographics });
  } catch (error) {
    console.error('Get demographics error:', error);
    res.status(500).json({ message: 'Error fetching demographics data' });
  }
});

app.get('/api/analytics/employee/turnover', authenticateToken, (req, res) => {
  try {
    // Check if user has admin or HR manager role
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') {
      return res.status(403).json({ message: 'Not authorized to view analytics' });
    }

    const { period } = req.query;
    
    // Mock turnover data based on period
    let turnoverData;
    
    if (period === '3months') {
      turnoverData = {
        currentRate: 8.5,
        trend: -2.1,
        months: ['Oct 2023', 'Nov 2023', 'Dec 2023'],
        rates: [10.2, 9.1, 8.5],
        industryAverage: [12.0, 12.0, 12.0]
      };
    } else if (period === '6months') {
      turnoverData = {
        currentRate: 8.5,
        trend: -1.8,
        months: ['Jul 2023', 'Aug 2023', 'Sep 2023', 'Oct 2023', 'Nov 2023', 'Dec 2023'],
        rates: [11.2, 10.8, 10.5, 10.2, 9.1, 8.5],
        industryAverage: [12.0, 12.0, 12.0, 12.0, 12.0, 12.0]
      };
    } else {
      turnoverData = {
        currentRate: 8.5,
        trend: -3.2,
        months: ['Jan 2023', 'Feb 2023', 'Mar 2023', 'Apr 2023', 'May 2023', 'Jun 2023', 'Jul 2023', 'Aug 2023', 'Sep 2023', 'Oct 2023', 'Nov 2023', 'Dec 2023'],
        rates: [15.2, 14.8, 13.5, 12.2, 11.8, 11.5, 11.2, 10.8, 10.5, 10.2, 9.1, 8.5],
        industryAverage: [12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0]
      };
    }

    res.json({ data: turnoverData });
  } catch (error) {
    console.error('Get turnover error:', error);
    res.status(500).json({ message: 'Error fetching turnover data' });
  }
});

app.get('/api/analytics/employee/headcount-trends', authenticateToken, (req, res) => {
  try {
    // Check if user has admin or HR manager role
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') {
      return res.status(403).json({ message: 'Not authorized to view analytics' });
    }

    const { period } = req.query;
    
    // Mock headcount data based on period
    let headcountData;
    
    if (period === '3months') {
      headcountData = {
        months: ['Oct 2023', 'Nov 2023', 'Dec 2023'],
        total: [148, 152, 156],
        newHires: [8, 6, 7],
        departures: [4, 2, 3]
      };
    } else if (period === '6months') {
      headcountData = {
        months: ['Jul 2023', 'Aug 2023', 'Sep 2023', 'Oct 2023', 'Nov 2023', 'Dec 2023'],
        total: [135, 140, 144, 148, 152, 156],
        newHires: [10, 8, 6, 8, 6, 7],
        departures: [5, 3, 2, 4, 2, 3]
      };
    } else {
      headcountData = {
        months: ['Jan 2023', 'Feb 2023', 'Mar 2023', 'Apr 2023', 'May 2023', 'Jun 2023', 'Jul 2023', 'Aug 2023', 'Sep 2023', 'Oct 2023', 'Nov 2023', 'Dec 2023'],
        total: [120, 118, 122, 125, 128, 132, 135, 140, 144, 148, 152, 156],
        newHires: [5, 3, 8, 6, 7, 9, 10, 8, 6, 8, 6, 7],
        departures: [7, 5, 4, 3, 4, 5, 5, 3, 2, 4, 2, 3]
      };
    }

    res.json({ data: headcountData });
  } catch (error) {
    console.error('Get headcount trends error:', error);
    res.status(500).json({ message: 'Error fetching headcount trends data' });
  }
});

app.get('/api/analytics/employee/satisfaction', authenticateToken, (req, res) => {
  try {
    // Check if user has admin or HR manager role
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') {
      return res.status(403).json({ message: 'Not authorized to view analytics' });
    }

    // Mock satisfaction data
    const satisfactionData = {
      averageScore: 4.2,
      improvement: 8.5,
      categories: [
        { name: 'Work-Life Balance', score: 4.1 },
        { name: 'Career Growth', score: 3.9 },
        { name: 'Compensation', score: 4.3 },
        { name: 'Management', score: 4.0 },
        { name: 'Work Environment', score: 4.5 }
      ],
      trends: {
        months: ['Aug 2023', 'Sep 2023', 'Oct 2023', 'Nov 2023', 'Dec 2023'],
        scores: [3.8, 3.9, 4.0, 4.1, 4.2]
      }
    };

    res.json({ data: satisfactionData });
  } catch (error) {
    console.error('Get satisfaction error:', error);
    res.status(500).json({ message: 'Error fetching satisfaction data' });
  }
});

// Attendance Analytics endpoints
app.get('/api/analytics/attendance/patterns', authenticateToken, (req, res) => {
  try {
    // Check if user has admin or HR manager role
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') {
      return res.status(403).json({ message: 'Not authorized to view analytics' });
    }

    // Mock attendance patterns data
    const patternsData = {
      dailyPatterns: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        attendanceRates: [92, 95, 96, 94, 89]
      },
      monthlyTrends: {
        months: ['Aug 2023', 'Sep 2023', 'Oct 2023', 'Nov 2023', 'Dec 2023'],
        rates: [91, 93, 95, 94, 92]
      },
      departmentWise: [
        { department: 'Engineering', rate: 96 },
        { department: 'Sales', rate: 89 },
        { department: 'Marketing', rate: 92 },
        { department: 'HR', rate: 98 },
        { department: 'Finance', rate: 94 }
      ]
    };

    res.json({ data: patternsData });
  } catch (error) {
    console.error('Get attendance patterns error:', error);
    res.status(500).json({ message: 'Error fetching attendance patterns data' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'HRM Server is running' });
});

// Default route
// Employee endpoints
app.post('/api/employees', authenticateToken, async (req, res) => {
  try {
    // Check if user has admin or HR manager role
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') {
      return res.status(403).json({ message: 'Not authorized to create employees' });
    }

    // Check if email already exists in User collection
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: 'Employee with this email already exists' });
    }

    // Check if employee ID already exists
    const existingEmployee = await Employee.findOne({ employeeId: req.body.employeeId });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee with this ID already exists' });
    }

    // Create employee record
    const employee = new Employee({
      ...req.body,
      createdBy: req.user.email
    });
    await employee.save();

    // Use custom password if provided, otherwise generate a secure random password
    let employeePassword;
    let isCustomPassword = false;
    
    if (req.body.password && req.body.password.trim()) {
      // Use custom password provided by admin
      employeePassword = req.body.password.trim();
      isCustomPassword = true;
      
      // Basic password validation for custom password
      if (employeePassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }
      if (employeePassword.length > 50) {
        return res.status(400).json({ message: 'Password must be less than 50 characters long' });
      }
    } else {
      // Generate secure random password if no custom password provided
      employeePassword = PasswordGenerator.generateRandomPassword();
      
      // Validate the generated password
      const passwordValidation = PasswordGenerator.validatePassword(employeePassword);
      if (!passwordValidation.isValid) {
        console.error('Generated password failed validation:', passwordValidation);
        return res.status(500).json({ message: 'Error generating secure password' });
      }
    }

    // Determine the role - use the role from request body, default to 'employee'
    const userRole = req.body.role || 'employee';
    
    // Validate role
    const validRoles = ['employee', 'hr_manager', 'admin'];
    if (!validRoles.includes(userRole)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Create user account with the password (custom or generated)
    // Set lastLogin to current date so user can login directly without password change requirement
    console.log('Creating user with password:', employeePassword);
    const user = new User({
      email: req.body.email,
      password: employeePassword,
      role: userRole,
      employeeId: employee._id,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      lastLogin: new Date(), // Set lastLogin to allow direct login
      createdBy: req.user.email
    });
    await user.save();
    console.log('User created:', user.email, 'with hashed password:', user.password);

    // Send welcome email with login credentials using multiple providers
    console.log('📧 Attempting to send welcome email with multiple providers...');
    const emailResult = await realEmailService.sendWelcomeEmail(employee, employeePassword);
    
    // Log email sending result
    if (emailResult.success) {
      console.log(`✅ Welcome email sent successfully to ${employee.email} via ${emailResult.provider}`);
      console.log(`📧 Message ID: ${emailResult.messageId}`);
    } else {
      console.error(`❌ Failed to send welcome email to ${employee.email} with all providers:`, emailResult.error);
      console.log('📧 Attempted providers:', emailResult.attemptedProviders);
    }

    // Prepare response data (exclude sensitive information)
    const responseData = {
      _id: employee._id,
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      department: employee.department,
      designation: employee.designation,
      employmentType: employee.employmentType,
      salary: employee.salary,
      dateOfJoining: employee.dateOfJoining,
      dateOfBirth: employee.dateOfBirth,
      status: employee.status,
      createdAt: employee.createdAt,
      userAccountCreated: true
    };

    res.status(201).json({ 
      message: `Employee created successfully with ${isCustomPassword ? 'custom' : 'auto-generated'} credentials`,
      data: responseData,
      emailSent: emailResult.success,
      emailDetails: emailResult.success ? {
        provider: emailResult.provider,
        messageId: emailResult.messageId,
        recipient: employee.email
      } : {
        error: emailResult.error,
        attemptedProviders: emailResult.attemptedProviders
      },
      passwordType: isCustomPassword ? 'custom' : 'generated',
      securityNote: 'Employee can login directly with provided credentials. Password can be changed anytime from profile settings.'
    });
  } catch (error) {
    console.error('Create employee error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `Employee with this ${field} already exists`,
        field: field
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ 
        message: 'Validation error',
        errors: validationErrors
      });
    }
    
    res.status(500).json({ 
      message: 'Error creating employee',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/employees', authenticateToken, async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json({ data: employees });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Error fetching employees' });
  }
});

app.get('/api/employees/:id', authenticateToken, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ data: employee });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Error fetching employee' });
  }
});

app.put('/api/employees/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user has admin or HR manager role
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') {
      return res.status(403).json({ message: 'Not authorized to update employees' });
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ 
      message: 'Employee updated successfully',
      data: employee 
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Error updating employee' });
  }
});

app.delete('/api/employees/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete employees' });
    }

    // Find the employee first
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Delete the associated user account first
    await User.findOneAndDelete({ email: employee.email });
    
    // Delete the employee record
    await Employee.findByIdAndDelete(req.params.id);

    res.json({ 
      message: 'Employee and associated user account deleted successfully',
      data: employee 
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Error deleting employee' });
  }
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'HRM System API Server',
    version: '1.0.0',
    endpoints: [
      'POST /api/auth/login',
      'GET /api/auth/me',
      'POST /api/auth/logout',
      'GET /api/health',
      'POST /api/employees',
      'GET /api/employees',
      'GET /api/employees/:id',
      'PUT /api/employees/:id',
      'DELETE /api/employees/:id'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 HRM Server running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
  console.log(`🔐 Available test accounts:`);
  console.log(`   Admin: admin@hrm.com / admin123`);
  console.log(`   HR: hr@hrm.com / hr123456`);
  console.log(`   Employee: employee@hrm.com / emp123`);
});
