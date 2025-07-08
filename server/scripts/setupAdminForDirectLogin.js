const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrm_system';

async function setupAdminForDirectLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📦 Connected to MongoDB');

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@hrm.com' });
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    // Set password and mark as not first login
    adminUser.password = 'admin123';
    adminUser.isFirstLogin = false;
    adminUser.lastLogin = new Date();
    await adminUser.save();
    
    console.log('✅ Admin account setup completed');
    console.log('📧 Email: admin@hrm.com');
    console.log('🔑 Password: admin123');
    console.log('🎯 Ready for direct login without password change requirement');
    
  } catch (error) {
    console.error('❌ Error setting up admin account:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB');
  }
}

setupAdminForDirectLogin();
