const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Employee = require('../models/Employee');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrm_system';

async function deleteEmployeesAndHR() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Delete users with role 'employee' or 'hr_manager'
    const userDeleteResult = await User.deleteMany({ role: { $in: ['employee', 'hr_manager'] } });
    console.log(`Deleted ${userDeleteResult.deletedCount} users with role employee or hr_manager`);

    // Delete all employees
    const employeeDeleteResult = await Employee.deleteMany({});
    console.log(`Deleted ${employeeDeleteResult.deletedCount} employees`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error deleting employees and HR users:', error);
    process.exit(1);
  }
}

