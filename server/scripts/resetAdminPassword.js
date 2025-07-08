const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrm_system';

async function resetAdminPassword() {
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

    // Reset password to default
    adminUser.password = 'admin123';
    await adminUser.save();
    
    console.log('✅ Admin password reset to: admin123');
    console.log('📧 Admin email: admin@hrm.com');
    
  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB');
  }
}

resetAdminPassword();
