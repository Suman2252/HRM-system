const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Employee = require('../models/Employee');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrm_system';

// Employee data
const employeeData = {
  employeeId: 'EMP001',
  firstName: 'John',
  lastName: 'Doe',
  email: 'sumanrio99@gmail.com',
  phone: '+1234567890',
  department: 'IT',
  designation: 'Software Developer',
  employmentType: 'full_time',
  salary: 50000,
  dateOfJoining: new Date(),
  dateOfBirth: new Date('1990-01-01'),
  address: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA'
  },
  emergencyContact: {
    name: 'Jane Doe',
    relationship: 'Spouse',
    phone: '+1234567891'
  },
  status: 'active',
  createdBy: 'admin@hrm.com'
};

const createEmployee = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📦 Connected to MongoDB');

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ email: employeeData.email });
    if (existingEmployee) {
      console.log('❌ Employee with this email already exists');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: employeeData.email });
    if (existingUser) {
      console.log('❌ User with this email already exists');
      process.exit(1);
    }

    // Create employee record
    const employee = new Employee(employeeData);
    await employee.save();
    console.log('✅ Employee created successfully');

    // Create user account with default password
    const defaultPassword = 'emp123';
    const user = new User({
      email: employeeData.email,
      password: defaultPassword,
      role: 'employee',
      employeeId: employee._id,
      firstName: employeeData.firstName,
      lastName: employeeData.lastName,
      phone: employeeData.phone,
      createdBy: 'admin@hrm.com'
    });
    await user.save();
    console.log('✅ User account created successfully');

    console.log('\n🎉 Employee and user account created successfully!');
    console.log('📧 Email:', employeeData.email);
    console.log('🔑 Password:', defaultPassword);
    console.log('👤 Employee ID:', employeeData.employeeId);
    console.log('📛 Name:', `${employeeData.firstName} ${employeeData.lastName}`);
    console.log('🏢 Department:', employeeData.department);
    console.log('💼 Designation:', employeeData.designation);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating employee:', error);
    process.exit(1);
  }
};

createEmployee();
