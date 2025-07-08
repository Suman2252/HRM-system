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

// Mock endpoints for other features (excluding employees since we have real endpoints)
app.get('/api/attendance', authenticateToken, (req, res) => {
  res.json({ data: [], message: 'Attendance data not available in demo mode' });
});

app.get('/api/leave', authenticateToken, (req, res) => {
  res.json({ data: [], message: 'Leave data not available in demo mode' });
});

app.get('/api/payroll', authenticateToken, (req, res) => {
  res.json({ data: [], message: 'Payroll data not available in demo mode' });
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
  console.log(`   HR: hr@hrm.com / hr123`);
  console.log(`   Employee: employee@hrm.com / emp123`);
});
