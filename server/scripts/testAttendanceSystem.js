const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function testAttendanceSystem() {
  try {
    console.log('🧪 Testing Dynamic Attendance System...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@hrm.com',
      password: 'admin123'
    });

    const { token, user, attendanceMessage } = loginResponse.data;
    console.log(`✅ Login successful! User: ${user.firstName} ${user.lastName}`);
    console.log(`📋 Attendance Message: ${attendanceMessage}\n`);

    // Set authorization header for subsequent requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Step 2: Check today's attendance
    console.log('2. Checking today\'s attendance status...');
    const todayResponse = await axios.get(`${BASE_URL}/api/attendance/today`);
    console.log('✅ Today\'s attendance:', JSON.stringify(todayResponse.data.data, null, 2));
    console.log('');

    // Step 3: Get attendance records for current month
    console.log('3. Fetching attendance records for current month...');
    const attendanceResponse = await axios.get(`${BASE_URL}/api/attendance`);
    console.log('✅ Attendance records:', JSON.stringify(attendanceResponse.data, null, 2));
    console.log('');

    // Step 4: Test manual check-out
    console.log('4. Testing manual check-out...');
    const checkoutResponse = await axios.post(`${BASE_URL}/api/attendance/checkout`, {
      notes: 'Manual checkout test'
    });
    console.log('✅ Checkout response:', JSON.stringify(checkoutResponse.data, null, 2));
    console.log('');

    // Step 5: Test logout (should record checkout if not already done)
    console.log('5. Testing logout...');
    const logoutResponse = await axios.post(`${BASE_URL}/api/auth/logout`);
    console.log('✅ Logout response:', JSON.stringify(logoutResponse.data, null, 2));
    console.log('');

    console.log('🎉 All attendance system tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAttendanceSystem();
