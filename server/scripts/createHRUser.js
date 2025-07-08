const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrm_system';

async function createHRUser() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const email = 'newhruser@hrm.com';
    const password = 'hrpass123'; // at least 6 characters
    const role = 'hr_manager';

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`User with email ${email} already exists.`);
      await mongoose.disconnect();
      return;
    }

    // Create new HR manager user
    const newUser = new User({
      email,
      password,
      role,
      firstName: 'HR',
      lastName: 'Manager',
      isActive: true,
      createdBy: 'system'
    });

    await newUser.save();
    console.log(`HR manager user created with email: ${email} and password: ${password}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error creating HR user:', error);
    process.exit(1);
  }
}

createHRUser();
