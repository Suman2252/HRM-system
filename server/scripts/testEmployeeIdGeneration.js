const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrm_system';
const API_URL = 'http://localhost:5001';

async function testEmployeeIdGeneration() {
  try {
    console.log('🧪 Testing Automatic Employee ID Generation...\n');

    // Login as admin to create employees
    const adminLogin = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@hrm.com',
      password: 'admin123'
    });

    if (adminLogin.status !== 200) {
      throw new Error('Admin login failed');
    }

    const adminToken = adminLogin.data.token;
    console.log('✅ Admin login successful\n');

    // Test 1: Create an Employee (should get EMP0001, EMP0002, etc.)
    console.log('1️⃣ Testing Employee ID Generation:');
    try {
      const employeeData = {
        email: 'test.emp1@hrm.com',
        firstName: 'Test',
        lastName: 'Employee1',
        role: 'employee',
        department: 'IT',
        designation: 'Developer'
      };

      const empResponse = await axios.post(`${API_URL}/api/employees`, employeeData, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (empResponse.status === 201) {
        console.log(`✅ Employee created with ID: ${empResponse.data.data.employeeCode}`);
        console.log(`   Expected format: EMP#### - ${empResponse.data.data.employeeCode.startsWith('EMP') ? '✅ Correct' : '❌ Incorrect'}`);
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('already exists')) {
        console.log('ℹ️  Employee already exists (expected for repeated tests)');
      } else {
        console.log('❌ Employee creation failed:', error.response?.data?.message);
      }
    }

    // Test 2: Create an HR Manager (should get HRM0001, HRM0002, etc.)
    console.log('\n2️⃣ Testing HR Manager ID Generation:');
    try {
      const hrData = {
        email: 'test.hr1@hrm.com',
        firstName: 'Test',
        lastName: 'HRManager1',
        role: 'hr_manager',
        department: 'HR',
        designation: 'HR Manager'
      };

      const hrResponse = await axios.post(`${API_URL}/api/employees`, hrData, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (hrResponse.status === 201) {
        console.log(`✅ HR Manager created with ID: ${hrResponse.data.data.employeeCode}`);
        console.log(`   Expected format: HRM#### - ${hrResponse.data.data.employeeCode.startsWith('HRM') ? '✅ Correct' : '❌ Incorrect'}`);
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('already exists')) {
        console.log('ℹ️  HR Manager already exists (expected for repeated tests)');
      } else {
        console.log('❌ HR Manager creation failed:', error.response?.data?.message);
      }
    }

    // Test 3: Create an Admin (should get ADM0001, ADM0002, etc.)
    console.log('\n3️⃣ Testing Admin ID Generation:');
    try {
      const adminData = {
        email: 'test.admin1@hrm.com',
        firstName: 'Test',
        lastName: 'Admin1',
        role: 'admin',
        department: 'Administration',
        designation: 'System Admin'
      };

      const adminResponse = await axios.post(`${API_URL}/api/employees`, adminData, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (adminResponse.status === 201) {
        console.log(`✅ Admin created with ID: ${adminResponse.data.data.employeeCode}`);
        console.log(`   Expected format: ADM#### - ${adminResponse.data.data.employeeCode.startsWith('ADM') ? '✅ Correct' : '❌ Incorrect'}`);
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('already exists')) {
        console.log('ℹ️  Admin already exists (expected for repeated tests)');
      } else {
        console.log('❌ Admin creation failed:', error.response?.data?.message);
      }
    }

    // Test 4: Verify all users have proper Employee IDs
    console.log('\n4️⃣ Verifying All Employee IDs:');
    const allUsers = await axios.get(`${API_URL}/api/employees`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (allUsers.status === 200) {
      const users = allUsers.data.data;
      console.log(`✅ Found ${users.length} users in system:`);
      
      users.forEach(user => {
        const idFormat = user.employeeCode || 'No ID';
        let expectedPrefix = '';
        switch(user.role) {
          case 'employee': expectedPrefix = 'EMP'; break;
          case 'hr_manager': expectedPrefix = 'HRM'; break;
          case 'admin': expectedPrefix = 'ADM'; break;
        }
        
        const isCorrectFormat = idFormat.startsWith(expectedPrefix);
        console.log(`   ${user.role.toUpperCase()}: ${user.firstName} ${user.lastName} - ID: ${idFormat} ${isCorrectFormat ? '✅' : '❌'}`);
      });
    }

    console.log('\n🎉 Employee ID Generation testing completed!');
    
  } catch (error) {
    if (error.response) {
      console.error('❌ Test failed:', error.response.data.message);
      console.error('Status:', error.response.status);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Server is not running. Please start the server first.');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

console.log('🚀 Running Employee ID Generation Tests...\n');
testEmployeeIdGeneration();
