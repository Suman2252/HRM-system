const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrm_system';

async function updateAllUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📦 Connected to MongoDB');

    // Update all users to set lastLogin to current date
    const result = await User.updateMany(
      {}, // Update all users
      { $set: { lastLogin: new Date() } }
    );

    console.log(`✅ Updated ${result.modifiedCount} users with lastLogin timestamp`);

    // List all users to verify
    const users = await User.find({}, 'email role lastLogin');
    console.log('\n📋 All users in database:');
    users.forEach(user => {
      console.log(`   ${user.email} (${user.role}) - Last Login: ${user.lastLogin}`);
    });

    console.log('\n🎉 All users can now login without password change requirement!');
    
  } catch (error) {
    console.error('❌ Error updating users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB');
  }
}

updateAllUsers();
