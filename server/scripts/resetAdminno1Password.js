const mongoose = require('mongoose');
const User = require('../models/User');
const PasswordGenerator = require('../utils/passwordGenerator');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrm_system';

async function resetAdminno1Password() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📦 Connected to MongoDB');

    // Find the adminno1 user - try different possible email formats
    let user = await User.findOne({ email: 'adminno1@hrm.com' });
    
    if (!user) {
      // Try without @hrm.com
      user = await User.findOne({ email: 'adminno1' });
    }
    
    if (!user) {
      // Try with different domain
      user = await User.findOne({ email: 'adminno1@gmail.com' });
    }
    
    if (!user) {
      console.log('❌ User adminno1 not found with any common email format');
      console.log('🔍 Let me check what users exist...');
      
      // List all users to help find the correct email
      const allUsers = await User.find({}, 'email role createdAt');
      console.log('📋 All users in database:');
      allUsers.forEach(u => {
        console.log(`   - ${u.email} (${u.role}) - Created: ${u.createdAt}`);
      });
      
      process.exit(1);
    }

    // Generate a new secure password
    const newPassword = PasswordGenerator.generateRandomPassword();
    
    // Validate the password
    const validation = PasswordGenerator.validatePassword(newPassword);
    if (!validation.isValid) {
      console.error('❌ Generated password failed validation:', validation);
      process.exit(1);
    }

    // Update the user's password
    user.password = newPassword;
    await user.save();

    console.log('✅ Password reset successful!');
    console.log('📧 Login credentials for adminno1:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${newPassword}`);
    console.log('🔒 Please save this password securely!');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('📦 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    process.exit(1);
  }
}

resetAdminno1Password();
