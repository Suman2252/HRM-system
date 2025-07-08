const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrm_system';

async function createEmployeeUser() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const email = 'newemployee@hrm.com';
    const password = 'emppass123'; // at least 6 characters
    const role = 'employee';

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`User with email ${email} already exists.`);
      await mongoose.disconnect();
      return;
    }

    // Create new employee user
    const newUser = new User({
      email,
      password,
      role,
      isActive: true,
      createdBy: 'system'
    });

    await newUser.save();
    console.log(`Employee user created with email: ${email} and password: ${password}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error creating employee user:', error);
    process.exit(1);
  }
}

createEmployeeUser();
