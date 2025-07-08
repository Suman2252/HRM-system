const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrm_system';

async function updateMissingEmployeeIds() {
  try {
    console.log('🔧 Updating Missing Employee IDs...\n');

    // Connect to database
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📦 Connected to MongoDB');

    const User = require('../models/User');
    
    // Find users without Employee IDs
    const usersWithoutIds = await User.find({
      $or: [
        { employeeCode: { $exists: false } },
        { employeeCode: null },
        { employeeCode: '' }
      ]
    });

    console.log(`Found ${usersWithoutIds.length} users without Employee IDs\n`);

    if (usersWithoutIds.length === 0) {
      console.log('✅ All users already have Employee IDs');
      await mongoose.disconnect();
      return;
    }

    // Update each user with proper Employee ID
    for (const user of usersWithoutIds) {
      try {
        // Get role prefix
        let prefix;
        switch (user.role) {
          case 'employee':
            prefix = 'EMP';
            break;
          case 'hr_manager':
            prefix = 'HRM';
            break;
          case 'admin':
            prefix = 'ADM';
            break;
          default:
            prefix = 'USR';
        }

        // Find the next available number for this role
        let nextNumber = 1;
        let employeeCode;
        let isUnique = false;
        
        while (!isUnique) {
          employeeCode = `${prefix}${nextNumber.toString().padStart(4, '0')}`;
          
          // Check if this ID already exists
          const existingUser = await User.findOne({ employeeCode });
          if (!existingUser) {
            isUnique = true;
          } else {
            nextNumber++;
          }
        }

        // Update the user
        user.employeeCode = employeeCode;
        await user.save();
        
        console.log(`✅ Updated ${user.role.toUpperCase()}: ${user.firstName} ${user.lastName} - ID: ${employeeCode}`);
      } catch (error) {
        console.error(`❌ Failed to update user ${user.email}:`, error.message);
      }
    }

    console.log('\n🎉 Employee ID update completed!');
    
    // Verify all users now have IDs
    const stillMissingIds = await User.find({
      $or: [
        { employeeCode: { $exists: false } },
        { employeeCode: null },
        { employeeCode: '' }
      ]
    });

    if (stillMissingIds.length === 0) {
      console.log('✅ All users now have Employee IDs');
    } else {
      console.log(`⚠️  ${stillMissingIds.length} users still missing Employee IDs`);
    }

    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error updating Employee IDs:', error.message);
    await mongoose.disconnect();
  }
}

console.log('🚀 Starting Employee ID Update Process...\n');
updateMissingEmployeeIds();
