const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrm_system';

async function setAdminno1Password() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📦 Connected to MongoDB');

    // Find the adminno1 user
    const user = await User.findOne({ email: 'adminno1@hrm.com' });
    
    if (!user) {
      console.log('❌ User adminno1@hrm.com not found');
      process.exit(1);
    }

    // Set a simple, strong password
    const newPassword = 'Admin123!';
    
    // Update the user's password
    user.password = newPassword;
    await user.save();

    console.log('✅ Password set successfully!');
    console.log('📧 Login credentials for adminno1:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${newPassword}`);
    console.log('🔒 Please save this password securely!');
    
    // Test the login
    console.log('\n🧪 Testing login...');
    const testUser = await User.findOne({ email: 'adminno1@hrm.com' });
    const isPasswordValid = await testUser.comparePassword(newPassword);
    
    if (isPasswordValid) {
      console.log('✅ Login test successful!');
    } else {
      console.log('❌ Login test failed!');
    }
    
    // Close the connection
    await mongoose.connection.close();
    console.log('📦 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error setting password:', error);
    process.exit(1);
  }
}

setAdminno1Password();
