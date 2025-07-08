const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrm_system';
const API_URL = 'http://localhost:5001';

async function testLogin() {
  try {
    console.log('🧪 Testing login functionality...');
    
    // Test with admin credentials
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@hrm.com',
      password: 'admin123'
    });

    if (loginResponse.status === 200) {
      console.log('✅ Login successful!');
      console.log('👤 User data:', {
        email: loginResponse.data.user.email,
        role: loginResponse.data.user.role,
        firstName: loginResponse.data.user.firstName,
        lastName: loginResponse.data.user.lastName
      });
      console.log('🎉 Login validation errors have been fixed!');
    }
  } catch (error) {
    if (error.response) {
      console.error('❌ Login failed:', error.response.data.message);
      console.error('Status:', error.response.status);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Server is not running. Please start the server first.');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

// Test database connection and user validation
async function testDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📦 Connected to MongoDB');

    const User = require('../models/User');
    
    // Check if users have proper firstName and lastName
    const usersWithIssues = await User.find({
      $or: [
        { firstName: { $exists: false } },
        { firstName: '' },
        { firstName: null },
        { lastName: { $exists: false } },
        { lastName: '' },
        { lastName: null }
      ]
    });

    if (usersWithIssues.length === 0) {
      console.log('✅ All users have valid firstName and lastName fields');
    } else {
      console.log(`⚠️  Found ${usersWithIssues.length} users with missing name fields:`, 
        usersWithIssues.map(u => ({ email: u.email, firstName: u.firstName, lastName: u.lastName })));
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }
}

async function runTests() {
  console.log('🔧 Running HRM System Tests...\n');
  
  await testDatabase();
  console.log('');
  await testLogin();
  
  console.log('\n✅ Test completed!');
}

runTests();
