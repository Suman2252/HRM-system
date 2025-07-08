const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrm_system';

const resetUserPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📦 Connected to MongoDB');

    const email = 'sumanrio99@gmail.com';
    const newPassword = 'emp123';

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    console.log('✅ Password reset successfully!');
    console.log('\n🎉 User Login Credentials:');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', newPassword);
    console.log('👤 Role:', user.role);
    console.log('📛 Name:', `${user.firstName || 'N/A'} ${user.lastName || 'N/A'}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    process.exit(1);
  }
};

resetUserPassword();
