
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models and services
const User = require('./models/User');
const Attendance = require('./models/AttendanceEnhanced');
const Leave = require('./models/Leave');
const Payroll = require('./models/Payroll');
const Notification = require('./models/Notification');
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
      // Generate admin ID
      const adminCount = await User.countDocuments({ role: 'admin' });
      const adminCode = `ADM${(adminCount + 1).toString().padStart(4, '0')}`;
      
      const adminUser = new User({
        email: 'admin@hrm.com',
        password: 'admin123',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        employeeCode: adminCode,
        createdBy: 'system'
      });
      await adminUser.save();
      console.log(`✅ Default admin user created with ID: ${adminCode}`);
    } else if (!adminExists.employeeCode) {
      // Update existing admin with employee code
      const adminCount = await User.countDocuments({ role: 'admin' });
      const adminCode = `ADM${adminCount.toString().padStart(4, '0')}`;
      adminExists.employeeCode = adminCode;
      await adminExists.save();
      console.log(`✅ Default admin user updated with ID: ${adminCode}`);
    }

    // Check if HR manager exists
    const hrExists = await User.findOne({ email: 'hr@hrm.com' });
    if (!hrExists) {
      // Generate HR ID
      const hrCount = await User.countDocuments({ role: 'hr_manager' });
      const hrCode = `HRM${(hrCount + 1).toString().padStart(4, '0')}`;
      
      const hrUser = new User({
        email: 'hr@hrm.com',
        password: 'hr123456',
        role: 'hr_manager',
        firstName: 'HR',
        lastName: 'Manager',
        employeeCode: hrCode,
        createdBy: 'system'
      });
      await hrUser.save();
      console.log(`✅ Default HR manager created with ID: ${hrCode}`);
    } else if (!hrExists.employeeCode) {
      // Update existing HR with employee code
      const hrCount = await User.countDocuments({ role: 'hr_manager' });
      const hrCode = `HRM${hrCount.toString().padStart(4, '0')}`;
      hrExists.employeeCode = hrCode;
      await hrExists.save();
      console.log(`✅ Default HR manager updated with ID: ${hrCode}`);
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

// Helper function to record attendance on login (supports multiple sessions)
const recordAttendanceOnLogin = async (userId) => {
  try {
    const today = new Date();
    const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Check if attendance record already exists for today
    let attendance = await Attendance.findOne({
      userId: userId,
      date: dateOnly
    });

    if (!attendance) {
      // Create new attendance record with first session
      attendance = new Attendance({
        userId: userId,
        date: dateOnly
      });
    }

    // Add new check-in session
    const result = attendance.addCheckIn(today, 'Login check-in');
    
    if (result.success) {
      await attendance.save();
      console.log(`✅ Attendance session ${attendance.sessions.length} recorded for user ${userId} at ${today.toLocaleTimeString()}`);
      return attendance;
    } else {
      console.log(`ℹ️ ${result.message} for user ${userId}`);
      return attendance; // Return existing attendance even if new session wasn't created
    }
  } catch (error) {
    console.error('Error recording attendance on login:', error);
    return null;
  }
};

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    let { email, password } = req.body;

    // Normalize email to lowercase and trim whitespace
    email = email.trim().toLowerCase();
    password = password.trim();

    // Find user by normalized email
    const user = await User.findOne({ email });
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

    // Update last login - handle validation errors gracefully
    try {
      user.lastLogin = new Date();
      await user.save();
    } catch (validationError) {
      // If validation fails due to missing required fields, update them with defaults
      if (validationError.name === 'ValidationError') {
        console.warn('User validation failed during login, fixing missing fields:', validationError.message);
        
        // Set default values for missing required fields
        if (!user.firstName || user.firstName.trim() === '') {
          user.firstName = 'User';
        }
        if (!user.lastName || user.lastName.trim() === '') {
          user.lastName = 'Name';
        }
        
        // Try saving again with default values
        user.lastLogin = new Date();
        await user.save();
        console.log('✅ User fields updated with defaults and login recorded');
      } else {
        // Re-throw if it's not a validation error
        throw validationError;
      }
    }

    // Record attendance on login (automatic check-in)
    const attendanceRecord = await recordAttendanceOnLogin(user._id);

    // Generate token
    const token = generateToken(user);

    // Prepare user data
    const userData = {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      department: user.department,
      designation: user.designation,
      lastLogin: user.lastLogin,
      todayAttendance: attendanceRecord ? {
        checkInTime: attendanceRecord.checkInTime,
        status: attendanceRecord.status,
        isLateCheckIn: attendanceRecord.isLateCheckIn
      } : null
    };

    // Prepare attendance message safely
    let attendanceMessage = 'Attendance not recorded';
    if (attendanceRecord && attendanceRecord.sessions && attendanceRecord.sessions.length > 0) {
      const lastSession = attendanceRecord.sessions[attendanceRecord.sessions.length - 1];
      if (lastSession && lastSession.checkInTime) {
        attendanceMessage = `Checked in at ${lastSession.checkInTime.toLocaleTimeString()}${attendanceRecord.isLateCheckIn ? ' (Late)' : ''}`;
      }
    }

    res.json({
      token,
      user: userData,
      attendanceMessage
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user endpoint
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare user data
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
      department: user.department,
      designation: user.designation,
      lastLogin: user.lastLogin
    };

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

// Helper function to record attendance on logout (supports multiple sessions)
const recordAttendanceOnLogout = async (userId) => {
  try {
    const today = new Date();
    const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Find today's attendance record
    let attendance = await Attendance.findOne({
      userId: userId,
      date: dateOnly
    });

    if (attendance) {
      // Add check-out to the current active session
      const result = attendance.addCheckOut(today, 'Logout check-out');
      
      if (result.success) {
        await attendance.save();
        console.log(`✅ Attendance session checkout recorded for user ${userId} at ${today.toLocaleTimeString()}`);
        return attendance;
      } else {
        console.log(`ℹ️ ${result.message} for user ${userId}`);
        return null;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error recording attendance on logout:', error);
    return null;
  }
};

// Logout endpoint
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    // Record attendance on logout (automatic check-out)
    const attendanceRecord = await recordAttendanceOnLogout(req.user.id);
    
    let attendanceMessage = 'Attendance checkout not recorded';
    if (attendanceRecord) {
      // Find the last completed session to get checkout time
      const lastCompletedSession = attendanceRecord.sessions.filter(s => s.checkOutTime).pop();
      if (lastCompletedSession && lastCompletedSession.checkOutTime) {
        attendanceMessage = `Checked out at ${lastCompletedSession.checkOutTime.toLocaleTimeString()}. Total hours: ${attendanceRecord.totalHours.toFixed(2)}`;
      } else {
        attendanceMessage = `Checkout recorded. Total hours: ${attendanceRecord.totalHours.toFixed(2)}`;
      }
    }
    
    res.json({ 
      message: 'Logged out successfully',
      attendanceMessage
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.json({ message: 'Logged out successfully' });
  }
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
      employeeCode, bloodGroup, personalInfo, familyInfo, department, designation,
      salary, dateOfJoining, emergencyContact, status
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
    if (department !== undefined) user.department = department;
    if (designation !== undefined) user.designation = designation;
    if (salary !== undefined) user.salary = salary;
    if (dateOfJoining !== undefined) user.dateOfJoining = dateOfJoining;
    if (emergencyContact !== undefined) user.emergencyContact = emergencyContact;
    if (status !== undefined) user.status = status;

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
      department: user.department,
      designation: user.designation,
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

// Employee endpoints (now using User model)
app.post('/api/employees', authenticateToken, async (req, res) => {
  try {
    // Check if user has admin or HR manager role
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') {
      return res.status(403).json({ message: 'Not authorized to create employees' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Check if employee code already exists (if provided)
    if (req.body.employeeCode) {
      const existingEmployee = await User.findOne({ employeeCode: req.body.employeeCode });
      if (existingEmployee) {
        return res.status(400).json({ message: 'Employee with this code already exists' });
      }
    }

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

    // Generate automatic Employee ID based on role and existing count
    let employeeCode;
    if (!req.body.employeeCode) {
      // Count existing users of the same role
      const existingCount = await User.countDocuments({ role: userRole });
      const nextNumber = existingCount + 1;
      
      // Generate ID based on role
      switch (userRole) {
        case 'employee':
          employeeCode = `EMP${nextNumber.toString().padStart(4, '0')}`;
          break;
        case 'hr_manager':
          employeeCode = `HRM${nextNumber.toString().padStart(4, '0')}`;
          break;
        case 'admin':
          employeeCode = `ADM${nextNumber.toString().padStart(4, '0')}`;
          break;
        default:
          employeeCode = `USR${nextNumber.toString().padStart(4, '0')}`;
      }
    } else {
      employeeCode = req.body.employeeCode;
    }

    // Create user with all employee data in one record
    const user = new User({
      email: req.body.email,
      password: employeePassword,
      role: userRole,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone || '',
      department: req.body.department || '',
      designation: req.body.designation || '',
      employmentType: req.body.employmentType || '',
      salary: req.body.salary || 0,
      dateOfJoining: req.body.dateOfJoining || null,
      dateOfBirth: req.body.dateOfBirth || null,
      address: req.body.address || {},
      emergencyContact: req.body.emergencyContact || {},
      status: req.body.status || 'active',
      employeeCode: employeeCode,
      lastLogin: new Date(), // Set lastLogin to allow direct login
      createdBy: req.user.email
    });

    await user.save();
    console.log('User created:', user.email);

    // Send welcome email with login credentials
    console.log('📧 Attempting to send welcome email...');
    const emailResult = await realEmailService.sendWelcomeEmail({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      employeeId: user.employeeCode || user._id.toString().slice(-6)
    }, employeePassword);
    
    // Log email sending result
    if (emailResult.success) {
      console.log(`✅ Welcome email sent successfully to ${user.email} via ${emailResult.provider}`);
    } else {
      console.error(`❌ Failed to send welcome email to ${user.email}:`, emailResult.error);
    }

    // Prepare response data (exclude sensitive information)
    const responseData = {
      _id: user._id,
      employeeCode: user.employeeCode,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      department: user.department,
      designation: user.designation,
      employmentType: user.employmentType,
      salary: user.salary,
      dateOfJoining: user.dateOfJoining,
      dateOfBirth: user.dateOfBirth,
      status: user.status,
      role: user.role,
      createdAt: user.createdAt
    };

    res.status(201).json({ 
      message: `Employee created successfully with ${isCustomPassword ? 'custom' : 'auto-generated'} credentials`,
      data: responseData,
      emailSent: emailResult.success,
      passwordType: isCustomPassword ? 'custom' : 'generated'
    });
  } catch (error) {
    console.error('Create employee error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `User with this ${field} already exists`,
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
    let query = {};
    
    // Role-based visibility
    if (req.user.role === 'admin') {
      // Admin can see all users (employees, HR managers, and other admins)
      query = {};  // No filter - see all users
    } else if (req.user.role === 'hr_manager') {
      // HR managers can only see employees
      query = { role: 'employee' };
    } else {
      // Regular employees cannot access this endpoint
      return res.status(403).json({ message: 'Not authorized to view employee list' });
    }

    const employees = await User.find(query).select('-password'); // Exclude password field

    res.json({ data: employees });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Error fetching employees' });
  }
});

app.get('/api/employees/:id', authenticateToken, async (req, res) => {
  try {
    const employee = await User.findById(req.params.id).select('-password');
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

    const employee = await User.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).select('-password');

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

    // Find and delete the user
    const employee = await User.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ 
      message: 'Employee deleted successfully',
      data: employee 
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Error deleting employee' });
  }
});

// Dynamic Attendance endpoints
app.post('/api/attendance/checkin', authenticateToken, async (req, res) => {
  try {
    const { location, notes } = req.body;
    const attendanceRecord = await recordAttendanceOnLogin(req.user.id);
    
    if (attendanceRecord) {
      // Update notes if provided
      if (notes) {
        attendanceRecord.notes = notes;
        await attendanceRecord.save();
      }
      
      res.json({
        message: `Checked in successfully at ${attendanceRecord.checkInTime.toLocaleTimeString()}${attendanceRecord.isLateCheckIn ? ' (Late)' : ''}`,
        data: {
          id: attendanceRecord._id,
          date: attendanceRecord.date,
          checkInTime: attendanceRecord.checkInTime,
          status: attendanceRecord.status,
          isLateCheckIn: attendanceRecord.isLateCheckIn,
          notes: attendanceRecord.notes,
          location: location || 'Office'
        }
      });
    } else {
      res.status(400).json({ message: 'Already checked in today or error recording attendance' });
    }
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Error recording check-in' });
  }
});

app.post('/api/attendance/checkout', authenticateToken, async (req, res) => {
  try {
    const { notes } = req.body;
    const attendanceRecord = await recordAttendanceOnLogout(req.user.id);
    
    if (attendanceRecord) {
      // Update notes if provided
      if (notes) {
        attendanceRecord.notes = notes;
        await attendanceRecord.save();
      }
      
      // Find the last completed session to get checkout time
      const lastCompletedSession = attendanceRecord.sessions.filter(s => s.checkOutTime).pop();
      const checkoutTime = lastCompletedSession ? lastCompletedSession.checkOutTime : new Date();
      
      res.json({
        message: `Checked out successfully at ${checkoutTime.toLocaleTimeString()}. Total hours: ${attendanceRecord.totalHours.toFixed(2)}`,
        data: {
          id: attendanceRecord._id,
          date: attendanceRecord.date,
          checkInTime: attendanceRecord.sessions.length > 0 ? attendanceRecord.sessions[0].checkInTime : null,
          checkOutTime: checkoutTime,
          totalHours: attendanceRecord.totalHours,
          workingHours: attendanceRecord.workingHours,
          status: attendanceRecord.status,
          isEarlyCheckOut: attendanceRecord.isEarlyCheckOut,
          notes: attendanceRecord.notes
        }
      });
    } else {
      res.status(400).json({ message: 'No check-in found for today or already checked out' });
    }
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: 'Error recording check-out' });
  }
});

app.get('/api/attendance', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;
    
    // Determine which user's attendance to fetch
    let targetUserId = req.user.id;
    
    // If userId is provided and user has admin/HR role, allow viewing other user's attendance
    if (userId && (req.user.role === 'admin' || req.user.role === 'hr_manager')) {
      targetUserId = userId;
    }
    
    // Set date range (default to current month if not provided)
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Fetch attendance records
    const attendanceRecords = await Attendance.find({
      userId: targetUserId,
      date: {
        $gte: start,
        $lte: end
      }
    }).sort({ date: -1 });
    
    // Calculate summary
    const summary = {
      totalDays: attendanceRecords.length,
      presentDays: attendanceRecords.filter(r => r.status === 'present').length,
      lateDays: attendanceRecords.filter(r => r.status === 'late').length,
      halfDays: attendanceRecords.filter(r => r.status === 'half_day').length,
      absentDays: attendanceRecords.filter(r => r.status === 'absent').length,
      totalWorkingHours: attendanceRecords.reduce((sum, r) => sum + (r.workingHours || 0), 0),
      totalOvertimeHours: attendanceRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0)
    };
    
    // Format data for response with proper session handling
    const formattedData = attendanceRecords.map(record => {
      // Get first check-in and last check-out from sessions
      let firstCheckIn = null;
      let lastCheckOut = null;
      
      if (record.sessions && record.sessions.length > 0) {
        // Get first session's check-in time
        firstCheckIn = record.sessions[0].checkInTime;
        
        // Get last completed session's check-out time
        const completedSessions = record.sessions.filter(s => s.checkOutTime);
        if (completedSessions.length > 0) {
          lastCheckOut = completedSessions[completedSessions.length - 1].checkOutTime;
        }
      }
      
      return {
        id: record._id,
        date: record.date.toISOString().split('T')[0],
        checkInTime: firstCheckIn ? firstCheckIn.toLocaleTimeString() : null,
        checkOutTime: lastCheckOut ? lastCheckOut.toLocaleTimeString() : null,
        totalHours: record.totalHours ? record.totalHours.toFixed(2) : '0.00',
        workingHours: record.workingHours ? record.workingHours.toFixed(2) : '0.00',
        status: record.status,
        isLateCheckIn: record.isLateCheckIn,
        isEarlyCheckOut: record.isEarlyCheckOut,
        notes: record.notes,
        overtimeHours: record.overtimeHours ? record.overtimeHours.toFixed(2) : '0.00',
        sessions: record.sessions ? record.sessions.map(session => ({
          checkInTime: session.checkInTime ? session.checkInTime.toLocaleTimeString() : null,
          checkOutTime: session.checkOutTime ? session.checkOutTime.toLocaleTimeString() : null,
          sessionHours: session.sessionHours ? session.sessionHours.toFixed(2) : '0.00',
          notes: session.notes,
          isActive: session.isActive && !session.checkOutTime
        })) : []
      };
    });

    res.json({ 
      data: formattedData,
      summary: {
        ...summary,
        totalWorkingHours: summary.totalWorkingHours.toFixed(2),
        totalOvertimeHours: summary.totalOvertimeHours.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Error fetching attendance data' });
  }
});

// Get today's attendance status
app.get('/api/attendance/today', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const todayAttendance = await Attendance.findOne({
      userId: req.user.id,
      date: dateOnly
    });
    
    if (todayAttendance) {
      res.json({
        data: {
          id: todayAttendance._id,
          date: todayAttendance.date,
          checkInTime: todayAttendance.checkInTime,
          checkOutTime: todayAttendance.checkOutTime,
          status: todayAttendance.status,
          isLateCheckIn: todayAttendance.isLateCheckIn,
          isEarlyCheckOut: todayAttendance.isEarlyCheckOut,
          totalHours: todayAttendance.totalHours,
          workingHours: todayAttendance.workingHours,
          notes: todayAttendance.notes,
          hasCheckedIn: !!todayAttendance.checkInTime,
          hasCheckedOut: !!todayAttendance.checkOutTime
        }
      });
    } else {
      res.json({
        data: {
          hasCheckedIn: false,
          hasCheckedOut: false,
          status: 'absent'
        }
      });
    }
  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({ message: 'Error fetching today\'s attendance' });
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

// Leave Management System - Real Implementation
app.post('/api/leave/request', authenticateToken, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason, isHalfDay, halfDayPeriod, emergencyContact, handoverTo, handoverNotes } = req.body;
    
    // Validate required fields
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    
    if (start < today.setHours(0, 0, 0, 0)) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }
    
    if (end < start) {
      return res.status(400).json({ message: 'End date cannot be before start date' });
    }

    // Check for conflicts
    const conflicts = await Leave.checkConflicts(req.user.id, start, end);
    if (conflicts.length > 0) {
      return res.status(400).json({ 
        message: 'Leave request conflicts with existing leave',
        conflicts: conflicts.map(c => ({
          startDate: c.startDate,
          endDate: c.endDate,
          status: c.status
        }))
      });
    }

    // Check leave balance
    const currentYear = new Date().getFullYear();
    const leaveBalance = await Leave.getLeaveBalance(req.user.id, currentYear);
    
    // Create leave request
    const leaveRequest = new Leave({
      employeeId: req.user.id,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
      isHalfDay: isHalfDay || false,
      halfDayPeriod: isHalfDay ? halfDayPeriod : null,
      emergencyContact: emergencyContact || {},
      handoverTo: handoverTo || null,
      handoverNotes: handoverNotes || ''
    });

    await leaveRequest.save();

    // Create notification for HR/Admin
    const hrUsers = await User.find({ role: { $in: ['admin', 'hr_manager'] } });
    const user = await User.findById(req.user.id);
    
    for (const hrUser of hrUsers) {
      await Notification.createNotification({
        recipient: hrUser._id,
        sender: req.user.id,
        type: 'leave_request',
        title: 'New Leave Request',
        message: `${user.firstName} ${user.lastName} has submitted a ${leaveType} request from ${start.toDateString()} to ${end.toDateString()}`,
        data: {
          leaveId: leaveRequest._id,
          employeeId: req.user.id,
          leaveType,
          startDate,
          endDate
        },
        actionRequired: true,
        actionUrl: `/leave/requests/${leaveRequest._id}`
      });
    }

    res.status(201).json({
      message: 'Leave request submitted successfully',
      data: leaveRequest
    });
  } catch (error) {
    console.error('Leave request error:', error);
    res.status(500).json({ message: 'Error submitting leave request' });
  }
});

// Get leave requests for current user or all (for HR/Admin)
app.get('/api/leave', authenticateToken, async (req, res) => {
  try {
    const { status, year, employeeId } = req.query;
    let query = {};

    // Role-based access control
    if (req.user.role === 'admin' || req.user.role === 'hr_manager') {
      // Admin/HR can view all leaves or specific employee's leaves
      if (employeeId) {
        query.employeeId = employeeId;
      }
    } else {
      // Regular employees can only view their own leaves
      query.employeeId = req.user.id;
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Filter by year if provided
    if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31);
      query.startDate = { $gte: startOfYear, $lte: endOfYear };
    }

    const leaves = await Leave.find(query)
      .populate('employeeId', 'firstName lastName email employeeCode department')
      .populate('approvedBy', 'firstName lastName email')
      .populate('handoverTo', 'firstName lastName email')
      .sort({ appliedDate: -1 });

    res.json({ data: leaves });
  } catch (error) {
    console.error('Get leave error:', error);
    res.status(500).json({ message: 'Error fetching leave data' });
  }
});

// Get leave balance for current user
app.get('/api/leave/balance', authenticateToken, async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    
    const leaveBalance = await Leave.getLeaveBalance(req.user.id, targetYear);
    
    res.json({ data: leaveBalance });
  } catch (error) {
    console.error('Get leave balance error:', error);
    res.status(500).json({ message: 'Error fetching leave balance' });
  }
});

// Approve/Reject leave request (HR/Admin only)
app.put('/api/leave/:id/status', authenticateToken, async (req, res) => {
  try {
    // Check authorization
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') {
      return res.status(403).json({ message: 'Not authorized to approve/reject leave requests' });
    }

    const { status, rejectionReason } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be approved or rejected' });
    }

    const leave = await Leave.findById(req.params.id).populate('employeeId', 'firstName lastName email');
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Leave request has already been processed' });
    }

    // Update leave status
    leave.status = status;
    leave.approvedBy = req.user.id;
    leave.approvedDate = new Date();
    
    if (status === 'rejected' && rejectionReason) {
      leave.rejectionReason = rejectionReason;
    }

    await leave.save();

    // Create notification for employee
    const notificationType = status === 'approved' ? 'leave_approved' : 'leave_rejected';
    const notificationTitle = status === 'approved' ? 'Leave Request Approved' : 'Leave Request Rejected';
    const notificationMessage = status === 'approved' 
      ? `Your ${leave.leaveType} request from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been approved.`
      : `Your ${leave.leaveType} request from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been rejected. ${rejectionReason ? 'Reason: ' + rejectionReason : ''}`;

    await Notification.createNotification({
      recipient: leave.employeeId._id,
      sender: req.user.id,
      type: notificationType,
      title: notificationTitle,
      message: notificationMessage,
      data: {
        leaveId: leave._id,
        status,
        rejectionReason: rejectionReason || null
      }
    });

    res.json({
      message: `Leave request ${status} successfully`,
      data: leave
    });
  } catch (error) {
    console.error('Update leave status error:', error);
    res.status(500).json({ message: 'Error updating leave status' });
  }
});

// Cancel leave request (Employee only, for pending requests)
app.delete('/api/leave/:id', authenticateToken, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Check if user owns this leave request
    if (leave.employeeId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this leave request' });
    }

    // Can only cancel pending requests
    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending leave requests' });
    }

    leave.status = 'cancelled';
    await leave.save();

    res.json({
      message: 'Leave request cancelled successfully',
      data: leave
    });
  } catch (error) {
    console.error('Cancel leave error:', error);
    res.status(500).json({ message: 'Error cancelling leave request' });
  }
});

// Get leave calendar data
app.get('/api/leave/calendar', authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.query;
    const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);
    
    let query = {
      status: 'approved',
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
      ]
    };

    // Role-based filtering
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') {
      query.employeeId = req.user.id;
    }

    const leaves = await Leave.find(query)
      .populate('employeeId', 'firstName lastName employeeCode department')
      .sort({ startDate: 1 });

    const calendarData = leaves.map(leave => ({
      id: leave._id,
      title: `${leave.employeeId.firstName} ${leave.employeeId.lastName} - ${leave.leaveType}`,
      start: leave.startDate,
      end: new Date(leave.endDate.getTime() + 24 * 60 * 60 * 1000), // Add 1 day for full-day display
      employee: {
        name: `${leave.employeeId.firstName} ${leave.employeeId.lastName}`,
        code: leave.employeeId.employeeCode,
        department: leave.employeeId.department
      },
      leaveType: leave.leaveType,
      isHalfDay: leave.isHalfDay,
      reason: leave.reason
    }));

    res.json({ data: calendarData });
  } catch (error) {
    console.error('Get leave calendar error:', error);
    res.status(500).json({ message: 'Error fetching leave calendar data' });
  }
});

// Payroll Management System - Real Implementation
app.post('/api/payroll/generate', authenticateToken, async (req, res) => {
  try {
    // Check if user has admin or HR manager role
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') {
      return res.status(403).json({ message: 'Not authorized to generate payroll' });
    }

    const { month, year, employeeIds } = req.body;
    
    // Validate required fields
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    // Validate month and year
    if (month < 1 || month > 12) {
      return res.status(400).json({ message: 'Invalid month. Must be between 1 and 12' });
    }

    const currentYear = new Date().getFullYear();
    if (year < currentYear - 5 || year > currentYear + 1) {
      return res.status(400).json({ message: 'Invalid year' });
    }

    // Get employees to generate payroll for
    let employees;
    if (employeeIds && employeeIds.length > 0) {
      employees = await User.find({ 
        _id: { $in: employeeIds },
        role: 'employee',
        isActive: true 
      });
    } else {
      employees = await User.find({ 
        role: 'employee',
        isActive: true 
      });
    }

    if (employees.length === 0) {
      return res.status(400).json({ message: 'No active employees found' });
    }

    // Generate payroll for each employee
    const results = await Payroll.generateBulkPayroll(
      employees.map(emp => emp._id),
      month,
      year,
      req.user.id
    );

    // Calculate summary
    const successful = results.filter(r => r.status !== 'error');
    const failed = results.filter(r => r.status === 'error');
    const totalAmount = successful.reduce((sum, r) => sum + (r.payroll?.netSalary || 0), 0);

    // Create notifications for employees
    for (const result of successful) {
      if (result.status === 'created') {
        await Notification.createNotification({
          recipient: result.employeeId,
          sender: req.user.id,
          type: 'payroll_generated',
          title: 'Payroll Generated',
          message: `Your payroll for ${new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} has been generated. Net salary: ₹${result.payroll.netSalary.toFixed(2)}`,
          data: {
            payrollId: result.payroll._id,
            month,
            year,
            netSalary: result.payroll.netSalary
          }
        });
      }
    }

    res.json({
      message: `Payroll generated successfully for ${successful.length} employees`,
      data: {
        month,
        year,
        generatedBy: req.user.id,
        generatedDate: new Date(),
        employeeCount: successful.length,
        totalAmount,
        successful: successful.length,
        failed: failed.length,
        results: results
      }
    });
  } catch (error) {
    console.error('Payroll generation error:', error);
    res.status(500).json({ message: 'Error generating payroll' });
  }
});

// Get payroll records for current user or all (for HR/Admin)
app.get('/api/payroll', authenticateToken, async (req, res) => {
  try {
    const { month, year, employeeId, status } = req.query;
    let query = {};

    // Role-based access control
    if (req.user.role === 'admin' || req.user.role === 'hr_manager') {
      // Admin/HR can view all payrolls or specific employee's payroll
      if (employeeId) {
        query.employeeId = employeeId;
      }
    } else {
      // Regular employees can only view their own payroll
      query.employeeId = req.user.id;
    }

    // Filter by month and year if provided
    if (month && year) {
      query['payPeriod.month'] = parseInt(month);
      query['payPeriod.year'] = parseInt(year);
    } else if (year) {
      query['payPeriod.year'] = parseInt(year);
    }

    // Filter by status if provided
    if (status) {
      query.paymentStatus = status;
    }

    const payrolls = await Payroll.find(query)
      .populate('employeeId', 'firstName lastName email employeeCode department')
      .populate('generatedBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .sort({ 'payPeriod.year': -1, 'payPeriod.month': -1 });

    res.json({ data: payrolls });
  } catch (error) {
    console.error('Get payroll error:', error);
    res.status(500).json({ message: 'Error fetching payroll data' });
  }
});

// Get payroll history/summary (HR/Admin only)
app.get('/api/payroll/history', authenticateToken, async (req, res) => {
  try {
    // Check if user has admin or HR manager role
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') {
      return res.status(403).json({ message: 'Not authorized to view payroll history' });
    }

    const { year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    // Get payroll summary by month for the year
    const payrollHistory = await Payroll.aggregate([
      {
        $match: {
          'payPeriod.year': targetYear
        }
      },
      {
        $group: {
          _id: {
            month: '$payPeriod.month',
            year: '$payPeriod.year'
          },
          employeeCount: { $sum: 1 },
          totalAmount: { $sum: '$netSalary' },
          totalBasicSalary: { $sum: '$basicSalary' },
          totalAllowances: { $sum: '$totalAllowances' },
          totalDeductions: { $sum: '$totalDeductions' },
          generatedDate: { $first: '$generatedDate' },
          paymentStatuses: { $push: '$paymentStatus' }
        }
      },
      {
        $sort: { '_id.month': -1 }
      }
    ]);

    // Format the data
    const formattedHistory = payrollHistory.map(item => {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
      
      const paidCount = item.paymentStatuses.filter(status => status === 'paid').length;
      const pendingCount = item.paymentStatuses.filter(status => status === 'pending').length;
      const processedCount = item.paymentStatuses.filter(status => status === 'processed').length;

      return {
        id: `${item._id.year}-${item._id.month}`,
        month: monthNames[item._id.month - 1],
        year: item._id.year,
        monthYear: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        employeeCount: item.employeeCount,
        totalAmount: item.totalAmount,
        totalBasicSalary: item.totalBasicSalary,
        totalAllowances: item.totalAllowances,
        totalDeductions: item.totalDeductions,
        generatedDate: item.generatedDate,
        paymentStatus: {
          paid: paidCount,
          pending: pendingCount,
          processed: processedCount
        },
        status: paidCount === item.employeeCount ? 'completed' : 
                pendingCount > 0 ? 'pending' : 'processed'
      };
    });

    res.json({ data: formattedHistory });
  } catch (error) {
    console.error('Get payroll history error:', error);
    res.status(500).json({ message: 'Error fetching payroll history' });
  }
});

// Update payroll payment status (HR/Admin only)
app.put('/api/payroll/:id/payment', authenticateToken, async (req, res) => {
  try {
    // Check if user has admin or HR manager role
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') {
      return res.status(403).json({ message: 'Not authorized to update payroll payment status' });
    }

    const { paymentStatus, paymentMethod, paymentReference } = req.body;
    
    if (!['pending', 'processed', 'paid', 'failed'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    const payroll = await Payroll.findById(req.params.id).populate('employeeId', 'firstName lastName email');
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    // Update payment details
    payroll.paymentStatus = paymentStatus;
    if (paymentMethod) payroll.paymentMethod = paymentMethod;
    if (paymentReference) payroll.paymentReference = paymentReference;
    
    if (paymentStatus === 'paid') {
      payroll.paymentDate = new Date();
    }

    await payroll.save();

    // Create notification for employee
    if (paymentStatus === 'paid') {
      await Notification.createNotification({
        recipient: payroll.employeeId._id,
        sender: req.user.id,
        type: 'payroll_generated',
        title: 'Salary Paid',
        message: `Your salary for ${new Date(payroll.payPeriod.year, payroll.payPeriod.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} has been paid. Amount: ₹${payroll.netSalary.toFixed(2)}`,
        data: {
          payrollId: payroll._id,
          month: payroll.payPeriod.month,
          year: payroll.payPeriod.year,
          netSalary: payroll.netSalary,
          paymentDate: payroll.paymentDate
        }
      });
    }

    res.json({
      message: `Payroll payment status updated to ${paymentStatus}`,
      data: payroll
    });
  } catch (error) {
    console.error('Update payroll payment error:', error);
    res.status(500).json({ message: 'Error updating payroll payment status' });
  }
});

// Get individual payroll details
app.get('/api/payroll/:id', authenticateToken, async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate('employeeId', 'firstName lastName email employeeCode department')
      .populate('generatedBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email');

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    // Check access permissions
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager' && 
        payroll.employeeId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this payroll record' });
    }

    res.json({ data: payroll });
  } catch (error) {
    console.error('Get payroll details error:', error);
    res.status(500).json({ message: 'Error fetching payroll details' });
  }
});

// Approve payroll (Admin only)
app.put('/api/payroll/:id/approve', authenticateToken, async (req, res) => {
  try {
    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to approve payroll' });
    }

    const payroll = await Payroll.findById(req.params.id).populate('employeeId', 'firstName lastName email');
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    payroll.approvedBy = req.user.id;
    payroll.approvedDate = new Date();
    await payroll.save();

    res.json({
      message: 'Payroll approved successfully',
      data: payroll
    });
  } catch (error) {
    console.error('Approve payroll error:', error);
    res.status(500).json({ message: 'Error approving payroll' });
  }
});

// Get payroll statistics (HR/Admin only)
app.get('/api/payroll/stats', authenticateToken, async (req, res) => {
  try {
    // Check if user has admin or HR manager role
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') {
      return res.status(403).json({ message: 'Not authorized to view payroll statistics' });
    }

    const { year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    // Get payroll statistics
    const stats = await Payroll.aggregate([
      {
        $match: {
          'payPeriod.year': targetYear
        }
      },
      {
        $group: {
          _id: null,
          totalEmployees: { $addToSet: '$employeeId' },
          totalPayrolls: { $sum: 1 },
          totalAmount: { $sum: '$netSalary' },
          totalBasicSalary: { $sum: '$basicSalary' },
          totalAllowances: { $sum: '$totalAllowances' },
          totalDeductions: { $sum: '$totalDeductions' },
          avgSalary: { $avg: '$netSalary' },
          maxSalary: { $max: '$netSalary' },
          minSalary: { $min: '$netSalary' },
          paymentStatuses: { $push: '$paymentStatus' }
        }
      }
    ]);

    const result = stats[0] || {
      totalEmployees: [],
      totalPayrolls: 0,
      totalAmount: 0,
      totalBasicSalary: 0,
      totalAllowances: 0,
      totalDeductions: 0,
      avgSalary: 0,
      maxSalary: 0,
      minSalary: 0,
      paymentStatuses: []
    };

    // Count payment statuses
    const statusCounts = result.paymentStatuses.reduce((acc, status) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      data: {
        year: targetYear,
        totalEmployees: result.totalEmployees.length,
        totalPayrolls: result.totalPayrolls,
        totalAmount: result.totalAmount,
        totalBasicSalary: result.totalBasicSalary,
        totalAllowances: result.totalAllowances,
        totalDeductions: result.totalDeductions,
        avgSalary: result.avgSalary,
        maxSalary: result.maxSalary,
        minSalary: result.minSalary,
        paymentStatusBreakdown: {
          pending: statusCounts.pending || 0,
          processed: statusCounts.processed || 0,
          paid: statusCounts.paid || 0,
          failed: statusCounts.failed || 0
        }
      }
    });
  } catch (error) {
    console.error('Get payroll stats error:', error);
    res.status(500).json({ message: 'Error fetching payroll statistics' });
  }
});

// Real-time Analytics System - Database-driven Implementation
app.get('/api/analytics/employee/demographics', authenticateToken, async (req, res) => {
  try {
    // Check if user has admin or HR manager role
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') {
      return res.status(403).json({ message: 'Not authorized to view analytics' });
    }

    // Get real employee demographics from database
    const totalEmployees = await User.countDocuments({ role: 'employee', isActive: true });
    
    // Calculate growth rate (employees added in last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    
    const recentHires = await User.countDocuments({
      role: 'employee',
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const previousHires = await User.countDocuments({
      role: 'employee',
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });
    
    const growthRate = previousHires > 0 ? ((recentHires - previousHires) / previousHires * 100) : 0;

    // Get department distribution
    const departmentStats = await User.aggregate([
      { $match: { role: 'employee', isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const departments = departmentStats.map(dept => ({
      name: dept._id || 'Unassigned',
      count: dept.count
    }));

    // Calculate age groups from dateOfBirth
    const ageGroupStats = await User.aggregate([
      { 
        $match: { 
          role: 'employee', 
          isActive: true,
          dateOfBirth: { $exists: true, $ne: null }
        }
      },
      {
        $addFields: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$dateOfBirth'] },
                365.25 * 24 * 60 * 60 * 1000
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $and: [{ $gte: ['$age', 20] }, { $lt: ['$age', 26] }] }, then: '20-25' },
                { case: { $and: [{ $gte: ['$age', 26] }, { $lt: ['$age', 31] }] }, then: '26-30' },
                { case: { $and: [{ $gte: ['$age', 31] }, { $lt: ['$age', 36] }] }, then: '31-35' },
                { case: { $and: [{ $gte: ['$age', 36] }, { $lt: ['$age', 41] }] }, then: '36-40' },
                { case: { $gte: ['$age', 41] }, then: '41+' }
              ],
              default: 'Unknown'
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const ageGroups = ageGroupStats.map(group => ({
      range: group._id,
      count: group.count,
      percentage: Math.round((group.count / totalEmployees) * 100)
    }));

    // Get gender distribution from personalInfo
    const genderStats = await User.aggregate([
      { 
        $match: { 
          role: 'employee', 
          isActive: true,
          'personalInfo.gender': { $exists: true, $ne: '' }
        }
      },
      { $group: { _id: '$personalInfo.gender', count: { $sum: 1 } } }
    ]);

    const gender = genderStats.map(g => ({
      type: g._id || 'Not Specified',
      count: g.count,
      percentage: Math.round((g.count / totalEmployees) * 100)
    }));

    // Calculate experience based on dateOfJoining
    const experienceStats = await User.aggregate([
      { 
        $match: { 
          role: 'employee', 
          isActive: true,
          dateOfJoining: { $exists: true, $ne: null }
        }
      },
      {
        $addFields: {
          experience: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$dateOfJoining'] },
                365.25 * 24 * 60 * 60 * 1000
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $and: [{ $gte: ['$experience', 0] }, { $lt: ['$experience', 3] }] }, then: '0-2 years' },
                { case: { $and: [{ $gte: ['$experience', 3] }, { $lt: ['$experience', 6] }] }, then: '3-5 years' },
                { case: { $and: [{ $gte: ['$experience', 6] }, { $lt: ['$experience', 11] }] }, then: '6-10 years' },
                { case: { $gte: ['$experience', 11] }, then: '10+ years' }
              ],
              default: 'Unknown'
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const experience = experienceStats.map(exp => ({
      range: exp._id,
      count: exp.count,
      percentage: Math.round((exp.count / totalEmployees) * 100)
    }));

    // Calculate retention rate (employees who stayed for more than 1 year)
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const retainedEmployees = await User.countDocuments({
      role: 'employee',
      isActive: true,
      createdAt: { $lt: oneYearAgo }
    });
    
    const totalOldEmployees = await User.countDocuments({
      role: 'employee',
      createdAt: { $lt: oneYearAgo }
    });
    
    const retentionRate = totalOldEmployees > 0 ? Math.round((retainedEmployees / totalOldEmployees) * 100) : 100;

    const demographics = {
      totalEmployees,
      growthRate: Math.round(growthRate * 10) / 10,
      retentionRate,
      retentionTrend: Math.random() > 0.5 ? Math.round(Math.random() * 10) : -Math.round(Math.random() * 5), // Simulated trend
      departments,
      ageGroups,
      gender,
      experience
    };

    res.json({ data: demographics });
  } catch (error) {
    console.error('Get demographics error:', error);
    res.status(500).json({ message: 'Error fetching demographics data' });
  }
});

app.get('/api/analytics/employee/turnover', authenticateToken, async (req, res) => {
  try {
    // Check if user has admin or HR manager role
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') {
      return res.status(403).json({ message: 'Not authorized to view analytics' });
    }

    const { period = '12months' } = req.query;
    
    let months = [];
    let startDate, endDate;
    
    if (period === '3months') {
      for (let i = 2; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
      }
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
    } else if (period === '6months') {
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
      }
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
    } else {
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
      }
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
    }
    
    endDate = new Date();

    // Calculate turnover rates for each month
    const rates = [];
    const industryAverage = [];
    
    for (let i = 0; i < months.length; i++) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - (months.length - 1 - i));
      monthStart.setDate(1);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);
      
      // Count departures (deactivated employees) in this month
      const departures = await User.countDocuments({
        role: 'employee',
        isActive: false,
        updatedAt: { $gte: monthStart, $lte: monthEnd }
      });
      
      // Count total employees at the beginning of the month
      const totalEmployees = await User.countDocuments({
        role: 'employee',
        createdAt: { $lt: monthEnd }
      });
      
      const turnoverRate = totalEmployees > 0 ? (departures / totalEmployees) * 100 : 0;
      rates.push(Math.round(turnoverRate * 10) / 10);
      industryAverage.push(12.0); // Industry benchmark
    }

    const currentRate = rates[rates.length - 1] || 0;
    const previousRate = rates[rates.length - 2] || currentRate;
    const trend = currentRate - previousRate;

    const turnoverData = {
      currentRate,
      trend: Math.round(trend * 10) / 10,
      months,
      rates,
      industryAverage
    };

    res.json({ data: turnoverData });
  } catch (error) {
    console.error('Get turnover error:', error);
    res.status(500).json({ message: 'Error fetching turnover data' });
  }
});

app.get('/api/analytics/employee/headcount-trends', authenticateToken, async (req, res) => {
  try {
    // Check if user has admin or HR manager role
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') {
      return res.status(403).json({ message: 'Not authorized to view analytics' });
    }

    const { period = '12months' } = req.query;
    
    let months = [];
    let monthsCount = 12;
    
    if (period === '3months') {
      monthsCount = 3;
    } else if (period === '6months') {
      monthsCount = 6;
    }
    
    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    }

    const total = [];
    const newHires = [];
    const departures = [];

    for (let i = 0; i < months.length; i++) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - (months.length - 1 - i));
      monthStart.setDate(1);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);
      
      // Count total employees at end of month
      const totalCount = await User.countDocuments({
        role: 'employee',
        createdAt: { $lte: monthEnd },
        $or: [
          { isActive: true },
          { isActive: false, updatedAt: { $gt: monthEnd } }
        ]
      });
      
      // Count new hires in this month
      const hiresCount = await User.countDocuments({
        role: 'employee',
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });
      
      // Count departures in this month
      const departuresCount = await User.countDocuments({
        role: 'employee',
        isActive: false,
        updatedAt: { $gte: monthStart, $lte: monthEnd }
      });
      
      total.push(totalCount);
      newHires.push(hiresCount);
      departures.push(departuresCount);
    }

    const headcountData = {
      months,
      total,
      newHires,
      departures
    };

    res.json({ data: headcountData });
  } catch (error) {
    console.error('Get headcount trends error:', error);
    res.status(500).json({ message: 'Error fetching headcount trends data' });
  }
});

app.get('/api/analytics/employee/satisfaction', authenticateToken, async (req, res) => {
  try {
    // Check if user has admin or HR manager role
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') {
      return res.status(403).json({ message: 'Not authorized to view analytics' });
    }

    // Since we don't have a satisfaction survey system yet, we'll provide simulated data
    // based on real metrics like retention rate, attendance, etc.
    
    // Calculate base satisfaction from retention and attendance
    const totalEmployees = await User.countDocuments({ role: 'employee', isActive: true });
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    
    const retainedEmployees = await User.countDocuments({
      role: 'employee',
      isActive: true,
      createdAt: { $lt: oneYearAgo }
    });
    
    const retentionRate = totalEmployees > 0 ? (retainedEmployees / totalEmployees) : 1;
    
    // Get average attendance rate
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const attendanceRecords = await Attendance.find({
      date: { $gte: thirtyDaysAgo }
    });
    
    const avgAttendanceRate = attendanceRecords.length > 0 
      ? attendanceRecords.filter(r => r.status === 'present').length / attendanceRecords.length 
      : 0.95;

    // Calculate satisfaction score based on metrics
    const baseSatisfaction = (retentionRate * 0.4 + avgAttendanceRate * 0.3 + 0.3) * 5;
    const averageScore = Math.min(5, Math.max(1, baseSatisfaction));

    const satisfactionData = {
      averageScore: Math.round(averageScore * 10) / 10,
      improvement: Math.round((averageScore - 4.0) * 20), // Percentage improvement from baseline
      categories: [
        { name: 'Work-Life Balance', score: Math.round((averageScore + (Math.random() - 0.5) * 0.4) * 10) / 10 },
        { name: 'Career Growth', score: Math.round((averageScore + (Math.random() - 0.5) * 0.6) * 10) / 10 },
        { name: 'Compensation', score: Math.round((averageScore + (Math.random() - 0.5) * 0.3) * 10) / 10 },
        { name: 'Management', score: Math.round((averageScore + (Math.random() - 0.5) * 0.5) * 10) / 10 },
        { name: 'Work Environment', score: Math.round((averageScore + (Math.random() - 0.5) * 0.2) * 10) / 10 }
      ],
      trends: {
        months: ['Aug 2023', 'Sep 2023', 'Oct 2023', 'Nov 2023', 'Dec 2023'],
        scores: [
          Math.round((averageScore - 0.4) * 10) / 10,
          Math.round((averageScore - 0.3) * 10) / 10,
          Math.round((averageScore - 0.2) * 10) / 10,
          Math.round((averageScore - 0.1) * 10) / 10,
          Math.round(averageScore * 10) / 10
        ]
      }
    };

    res.json({ data: satisfactionData });
  } catch (error) {
    console.error('Get satisfaction error:', error);
    res.status(500).json({ message: 'Error fetching satisfaction data' });
  }
});

// Real-time Attendance Analytics
app.get('/api/analytics/attendance/patterns', authenticateToken, async (req, res) => {
  try {
    // Check if user has admin or HR manager role
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') {
      return res.status(403).json({ message: 'Not authorized to view analytics' });
    }

    const { period = '30days' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    if (period === '7days') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30days') {
      startDate.setDate(startDate.getDate() - 30);
    } else {
      startDate.setDate(startDate.getDate() - 90);
    }

    // Get daily attendance patterns
    const dailyPatterns = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $addFields: {
          dayOfWeek: { $dayOfWeek: '$date' }
        }
      },
      {
        $group: {
          _id: '$dayOfWeek',
          totalRecords: { $sum: 1 },
          presentRecords: {
            $sum: {
              $cond: [{ $eq: ['$status', 'present'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    const dailyData = {
      days: workingDays,
      attendanceRates: workingDays.map(day => {
        const dayIndex = dayNames.indexOf(day) + 1;
        const dayData = dailyPatterns.find(d => d._id === dayIndex);
        return dayData && dayData.totalRecords > 0 
          ? Math.round((dayData.presentRecords / dayData.totalRecords) * 100)
          : 95; // Default rate if no data
      })
    };

    // Get monthly trends
    const monthlyTrends = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalRecords: { $sum: 1 },
          presentRecords: {
            $sum: {
              $cond: [{ $eq: ['$status', 'present'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $limit: 5
      }
    ]);

    const monthlyData = {
      months: monthlyTrends.map(trend => {
        const date = new Date(trend._id.year, trend._id.month - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }),
      rates: monthlyTrends.map(trend => 
        trend.totalRecords > 0 
          ? Math.round((trend.presentRecords / trend.totalRecords) * 100)
          : 95
      )
    };

    // Get department-wise attendance
    const departmentAttendance = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $group: {
          _id: '$user.department',
          totalRecords: { $sum: 1 },
          presentRecords: {
            $sum: {
              $cond: [{ $eq: ['$status', 'present'] }, 1, 0]
            }
          }
        }
      },
      {
        $match: {
          _id: { $ne: null, $ne: '' }
        }
      }
    ]);

    const departmentWise = departmentAttendance.map(dept => ({
      department: dept._id || 'Unassigned',
      rate: dept.totalRecords > 0 
        ? Math.round((dept.presentRecords / dept.totalRecords) * 100)
        : 95
    }));

    const patternsData = {
      dailyPatterns: dailyData,
      monthlyTrends: monthlyData,
      departmentWise
    };

    res.json({ data: patternsData });
  } catch (error) {
    console.error('Get attendance patterns error:', error);
    res.status(500).json({ message: 'Error fetching attendance patterns data' });
  }
});

// Real-time Dashboard Analytics
app.get('/api/analytics/dashboard/overview', authenticateToken, async (req, res) => {
  try {
    // Check if user has admin or HR manager role
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') {
      return res.status(403).json({ message: 'Not authorized to view dashboard analytics' });
    }

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get total employees
    const totalEmployees = await User.countDocuments({ role: 'employee', isActive: true });
    
    // Get employees added this month
    const newEmployeesThisMonth = await User.countDocuments({
      role: 'employee',
      createdAt: { $gte: startOfMonth }
    });

    // Get today's attendance
    const todayAttendance = await Attendance.countDocuments({
      date: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      },
      status: { $in: ['present', 'late'] }
    });

    const attendanceRate = totalEmployees > 0 ? Math.round((todayAttendance / totalEmployees) * 100) : 0;

    // Get pending leave requests
    const pendingLeaves = await Leave.countDocuments({ status: 'pending' });

    // Get this month's payroll status
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    const payrollGenerated = await Payroll.countDocuments({
      'payPeriod.month': currentMonth,
      'payPeriod.year': currentYear
    });

    const payrollPaid = await Payroll.countDocuments({
      'payPeriod.month': currentMonth,
      'payPeriod.year': currentYear,
      paymentStatus: 'paid'
    });

    // Get recent activities (last 10 notifications)
    const recentActivities = await Notification.find({
      recipient: { $in: await User.find({ role: { $in: ['admin', 'hr_manager'] } }).distinct('_id') }
    })
    .populate('sender', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(10);

    const overview = {
      totalEmployees,
      newEmployeesThisMonth,
      attendanceRate,
      pendingLeaves,
      payroll: {
        generated: payrollGenerated,
        paid: payrollPaid,
        pending: payrollGenerated - payrollPaid
      },
      recentActivities: recentActivities.map(activity => ({
        id: activity._id,
        type: activity.type,
        title: activity.title,
        message: activity.message,
        sender: activity.sender ? `${activity.sender.firstName} ${activity.sender.lastName}` : 'System',
        createdAt: activity.createdAt,
        isRead: activity.isRead
      }))
    };

    res.json({ data: overview });
  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({ message: 'Error fetching dashboard overview data' });
  }
});

// Notification System Endpoints
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    let query = { recipient: req.user.id };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user.id, 
      isRead: false 
    });

    res.json({
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read', data: notification });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Error updating notification' });
  }
});

app.put('/api/notifications/mark-all-read', authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ message: 'Error updating notifications' });
  }
});

// Real-time Attendance Report with Database Integration
app.get('/api/attendance/report', authenticateToken, async (req, res) => {
  try {
    // Check if user has admin or HR manager role
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') {
      return res.status(403).json({ message: 'Not authorized to view attendance reports' });
    }

    const { month, year, department } = req.query;
    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);
    
    // Build query for attendance records
    let attendanceQuery = {
      date: { $gte: startDate, $lte: endDate }
    };

    // Get employees based on department filter
    let employeeQuery = { role: 'employee', isActive: true };
    if (department && department !== 'all') {
      employeeQuery.department = department;
    }

    const employees = await User.find(employeeQuery).select('_id firstName lastName department employeeCode');
    const employeeIds = employees.map(emp => emp._id);

    if (employeeIds.length > 0) {
      attendanceQuery.userId = { $in: employeeIds };
    }

    // Get attendance records
    const attendanceRecords = await Attendance.find(attendanceQuery)
      .populate('userId', 'firstName lastName department employeeCode');

    // Calculate working days in the month
    const workingDays = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude weekends
        workingDays.push(new Date(d));
      }
    }

    // Calculate summary
    const totalEmployees = employees.length;
    const totalWorkingDays = workingDays.length;
    const totalPossibleAttendance = totalEmployees * totalWorkingDays;
    
    const presentRecords = attendanceRecords.filter(r => r.status === 'present' || r.status === 'late');
    const absentRecords = totalPossibleAttendance - presentRecords.length;
    
    const averageAttendance = totalPossibleAttendance > 0 
      ? Math.round((presentRecords.length / totalPossibleAttendance) * 100 * 10) / 10
      : 0;

    // Calculate per-employee statistics
    const employeeStats = employees.map(employee => {
      const empAttendance = attendanceRecords.filter(r => 
        r.userId && r.userId._id.toString() === employee._id.toString()
      );
      
      const presentDays = empAttendance.filter(r => r.status === 'present' || r.status === 'late').length;
      const lateDays = empAttendance.filter(r => r.status === 'late').length;
      const absentDays = totalWorkingDays - presentDays;
      const attendanceRate = totalWorkingDays > 0 
        ? Math.round((presentDays / totalWorkingDays) * 100 * 10) / 10
        : 0;

      return {
        id: employee._id,
        name: `${employee.firstName} ${employee.lastName}`,
        employeeCode: employee.employeeCode,
        department: employee.department || 'Unassigned',
        presentDays,
        lateDays,
        absentDays,
        attendanceRate
      };
    });

    const report = {
      period: `${new Date(targetYear, targetMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      department: department === 'all' ? 'All Departments' : (department || 'All Departments'),
      summary: {
        totalEmployees,
        averageAttendance,
        totalWorkingDays,
        totalPresent: presentRecords.length,
        totalAbsent: absentRecords
      },
      employees: employeeStats.sort((a, b) => b.attendanceRate - a.attendanceRate)
    };

    res.json({ data: report });
  } catch (error) {
    console.error('Get attendance report error:', error);
    res.status(500).json({ message: 'Error fetching attendance report' });
  }
});

// Get next available Employee ID endpoint
app.get('/api/employees/next-id/:role', authenticateToken, async (req, res) => {
  try {
    // Check if user has admin or HR manager role
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') {
      return res.status(403).json({ message: 'Not authorized to get employee IDs' });
    }

    const { role } = req.params;
    
    // Validate role
    const validRoles = ['employee', 'hr_manager', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Get role prefix
    let prefix;
    switch (role) {
      case 'employee':
        prefix = 'EMP';
        break;
      case 'hr_manager':
        prefix = 'HRM';
        break;
      case 'admin':
        prefix = 'ADM';
        break;
      default:
        prefix = 'USR';
    }

    // Find the next available number for this role
    let nextNumber = 1;
    let employeeCode;
    let isUnique = false;
    
    while (!isUnique) {
      employeeCode = `${prefix}${nextNumber.toString().padStart(4, '0')}`;
      
      // Check if this ID already exists
      const existingUser = await User.findOne({ employeeCode });
      if (!existingUser) {
        isUnique = true;
      } else {
        nextNumber++;
      }
    }

    res.json({ 
      employeeCode,
      role,
      prefix,
      nextNumber
    });
  } catch (error) {
    console.error('Get next employee ID error:', error);
    res.status(500).json({ message: 'Error generating employee ID' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'HRM Server is running' });
});

// Default route
app.get('/', (req, res) => {
  res.json({ 
    message: 'HRM System API Server - Consolidated User Model',
    version: '2.0.0',
    note: 'All users (admin, hr_manager, employee) are now stored in a single User collection',
    endpoints: [
      'POST /api/auth/login',
      'GET /api/auth/me',
      'POST /api/auth/logout',
      'GET /api/health',
      'POST /api/employees',
      'GET /api/employees',
      'GET /api/employees/:id',
      'PUT /api/employees/:id',
      'DELETE /api/employees/:id',
      'GET /api/analytics/employee/demographics',
      'GET /api/analytics/employee/turnover',
      'GET /api/analytics/employee/headcount-trends',
      'GET /api/analytics/employee/satisfaction'
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
  console.log(`📦 Database: Using consolidated User model for all users`);
  console.log(`✅ Analytics & Reporting system active`);
});
