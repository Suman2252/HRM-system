const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrm_system';

async function resetNewAdminPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('📦 Connected to MongoDB');
    
    // Find the new admin user
    const newAdmin = await User.findOne({ email: 'newadmin@hrm.com' });
    if (!newAdmin) {
      console.log('❌ New admin user not found');
      return;
    }
    
    console.log('🔍 Found new admin user:');
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Current Role: ${newAdmin.role}`);
    
    // Reset password to a known value for testing
    const testPassword = 'admin123';
    newAdmin.password = testPassword;
    await newAdmin.save();
    
    console.log('✅ Password reset successfully!');
    console.log('🔑 New credentials:');
    console.log(`   Email: newadmin@hrm.com`);
    console.log(`   Password: ${testPassword}`);
    console.log(`   Role: ${newAdmin.role}`);
    
    await mongoose.connection.close();
    console.log('📦 Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

resetNewAdminPassword();
