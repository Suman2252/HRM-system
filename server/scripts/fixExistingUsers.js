const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrm_system';

async function fixExistingUsers() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Find users with missing or empty firstName/lastName
    const usersToFix = await User.find({
      $or: [
        { firstName: { $exists: false } },
        { firstName: '' },
        { firstName: null },
        { lastName: { $exists: false } },
        { lastName: '' },
        { lastName: null }
      ]
    });

    console.log(`Found ${usersToFix.length} users that need fixing...`);

    let fixedCount = 0;
    for (const user of usersToFix) {
      try {
        // Set default values based on role and email
        if (!user.firstName || user.firstName.trim() === '') {
          if (user.role === 'admin') {
            user.firstName = 'Admin';
          } else if (user.role === 'hr_manager') {
            user.firstName = 'HR';
          } else {
            user.firstName = 'User';
          }
        }

        if (!user.lastName || user.lastName.trim() === '') {
          if (user.role === 'admin') {
            user.lastName = 'User';
          } else if (user.role === 'hr_manager') {
            user.lastName = 'Manager';
          } else {
            user.lastName = 'Name';
          }
        }

        await user.save();
        console.log(`✅ Fixed user: ${user.email} - ${user.firstName} ${user.lastName}`);
        fixedCount++;
      } catch (error) {
        console.error(`❌ Error fixing user ${user.email}:`, error.message);
      }
    }

    console.log(`\n🎉 Migration completed! Fixed ${fixedCount} out of ${usersToFix.length} users.`);
    
    // Verify the fix by checking if any users still have missing names
    const remainingIssues = await User.find({
      $or: [
        { firstName: { $exists: false } },
        { firstName: '' },
        { firstName: null },
        { lastName: { $exists: false } },
        { lastName: '' },
        { lastName: null }
      ]
    });

    if (remainingIssues.length === 0) {
      console.log('✅ All users now have valid firstName and lastName fields!');
    } else {
      console.log(`⚠️  ${remainingIssues.length} users still have issues:`, remainingIssues.map(u => u.email));
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error fixing existing users:', error);
    process.exit(1);
  }
}

// Run the migration
console.log('🔧 Starting user migration to fix missing firstName/lastName fields...');
fixExistingUsers();
