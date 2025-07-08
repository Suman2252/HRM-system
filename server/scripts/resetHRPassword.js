const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrm_system';

async function resetHRPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('📦 Connected to MongoDB');
    
    // Find the HR user
    const hrUser = await User.findOne({ email: 'newhr@hrm.com' });
    if (!hrUser) {
      console.log('❌ HR user not found');
      return;
    }
    
    console.log('🔍 Found HR user:');
    console.log(`   Email: ${hrUser.email}`);
    console.log(`   Current Role: ${hrUser.role}`);
    
    // Reset password to a known value for testing
    const testPassword = 'hr123456';
    hrUser.password = testPassword;
    await hrUser.save();
    
    console.log('✅ Password reset successfully!');
    console.log('🔑 New credentials:');
    console.log(`   Email: newhr@hrm.com`);
    console.log(`   Password: ${testPassword}`);
    console.log(`   Role: ${hrUser.role}`);
    
    await mongoose.connection.close();
    console.log('📦 Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

resetHRPassword();
