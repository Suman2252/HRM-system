const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrm_system';

async function resetEmployeePassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('📦 Connected to MongoDB');
    
    // Find the employee user
    const empUser = await User.findOne({ email: 'newemployee@hrm.com' });
    if (!empUser) {
      console.log('❌ Employee user not found');
      return;
    }
    
    console.log('🔍 Found Employee user:');
    console.log(`   Email: ${empUser.email}`);
    console.log(`   Current Role: ${empUser.role}`);
    
    // Reset password to a known value for testing
    const testPassword = 'emp123456';
    empUser.password = testPassword;
    await empUser.save();
    
    console.log('✅ Password reset successfully!');
    console.log('🔑 New credentials:');
    console.log(`   Email: newemployee@hrm.com`);
    console.log(`   Password: ${testPassword}`);
    console.log(`   Role: ${empUser.role}`);
    
    await mongoose.connection.close();
    console.log('📦 Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

resetEmployeePassword();
