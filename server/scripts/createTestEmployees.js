const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrm_system';

async function createTestEmployees() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if employees already exist
    const existingEmployees = await User.find({ role: 'employee' });
    if (existingEmployees.length > 0) {
      console.log(`📊 Found ${existingEmployees.length} existing employees. Skipping creation.`);
      return;
    }

    console.log('👥 Creating test employees...');

    const testEmployees = [
      {
        email: 'john.doe@company.com',
        password: 'password123',
        role: 'employee',
        firstName: 'John',
        lastName: 'Doe',
        department: 'Engineering',
        designation: 'Software Engineer',
        phone: '+1-555-0101',
        salary: 75000,
        employeeCode: 'EMP0001',
        dateOfJoining: new Date('2023-01-15'),
        dateOfBirth: new Date('1990-05-20'),
        status: 'active',
        createdBy: 'system'
      },
      {
        email: 'jane.smith@company.com',
        password: 'password123',
        role: 'employee',
        firstName: 'Jane',
        lastName: 'Smith',
        department: 'Marketing',
        designation: 'Marketing Specialist',
        phone: '+1-555-0102',
        salary: 65000,
        employeeCode: 'EMP0002',
        dateOfJoining: new Date('2023-02-01'),
        dateOfBirth: new Date('1992-08-15'),
        status: 'active',
        createdBy: 'system'
      },
      {
        email: 'mike.johnson@company.com',
        password: 'password123',
        role: 'employee',
        firstName: 'Mike',
        lastName: 'Johnson',
        department: 'Sales',
        designation: 'Sales Representative',
        phone: '+1-555-0103',
        salary: 55000,
        employeeCode: 'EMP0003',
        dateOfJoining: new Date('2023-03-10'),
        dateOfBirth: new Date('1988-12-03'),
        status: 'active',
        createdBy: 'system'
      },
      {
        email: 'sarah.wilson@company.com',
        password: 'password123',
        role: 'employee',
        firstName: 'Sarah',
        lastName: 'Wilson',
        department: 'Finance',
        designation: 'Financial Analyst',
        phone: '+1-555-0104',
        salary: 70000,
        employeeCode: 'EMP0004',
        dateOfJoining: new Date('2023-04-05'),
        dateOfBirth: new Date('1991-03-25'),
        status: 'active',
        createdBy: 'system'
      },
      {
        email: 'david.brown@company.com',
        password: 'password123',
        role: 'employee',
        firstName: 'David',
        lastName: 'Brown',
        department: 'Operations',
        designation: 'Operations Manager',
        phone: '+1-555-0105',
        salary: 80000,
        employeeCode: 'EMP0005',
        dateOfJoining: new Date('2023-05-20'),
        dateOfBirth: new Date('1985-07-12'),
        status: 'active',
        createdBy: 'system'
      }
    ];

    for (const employeeData of testEmployees) {
      const employee = new User(employeeData);
      await employee.save();
      console.log(`✅ Created employee: ${employee.firstName} ${employee.lastName} (${employee.employeeCode})`);
    }

    console.log(`🎉 Successfully created ${testEmployees.length} test employees!`);
    
    // Verify the creation
    const totalEmployees = await User.countDocuments({ role: 'employee' });
    console.log(`📊 Total employees in database: ${totalEmployees}`);

  } catch (error) {
    console.error('❌ Error creating test employees:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createTestEmployees();
