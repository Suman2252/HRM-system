const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function testMultipleSessionsAttendance() {
  try {
    console.log('=== Testing Multiple Sessions Attendance ===\n');
    
    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'hariharish2604@gmail.com',
      password: '12345678'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('Attendance Message:', loginResponse.data.attendanceMessage);
    
    // Step 2: Check today's attendance
    console.log('\n2. Checking today\'s attendance...');
    const todayResponse = await axios.get(`${API_BASE}/attendance/today`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Today\'s attendance:', JSON.stringify(todayResponse.data, null, 2));
    
    // Step 3: Logout (first time)
    console.log('\n3. Logging out (first time)...');
    const logoutResponse1 = await axios.post(`${API_BASE}/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Logout successful');
    console.log('Attendance Message:', logoutResponse1.data.attendanceMessage);
    
    // Step 4: Login again (second session)
    console.log('\n4. Logging in again (second session)...');
    const loginResponse2 = await axios.post(`${API_BASE}/auth/login`, {
      email: 'hariharish2604@gmail.com',
      password: '12345678'
    });
    
    const token2 = loginResponse2.data.token;
    console.log('✅ Second login successful');
    console.log('Attendance Message:', loginResponse2.data.attendanceMessage);
    
    // Step 5: Check today's attendance after second login
    console.log('\n5. Checking today\'s attendance after second login...');
    const todayResponse2 = await axios.get(`${API_BASE}/attendance/today`, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    console.log('Today\'s attendance after second login:', JSON.stringify(todayResponse2.data, null, 2));
    
    // Step 6: Logout (second time)
    console.log('\n6. Logging out (second time)...');
    const logoutResponse2 = await axios.post(`${API_BASE}/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    console.log('✅ Second logout successful');
    console.log('Attendance Message:', logoutResponse2.data.attendanceMessage);
    
    // Step 7: Get full attendance data
    console.log('\n7. Getting full attendance data...');
    const attendanceResponse = await axios.get(`${API_BASE}/attendance`, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    console.log('Full attendance data:', JSON.stringify(attendanceResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testMultipleSessionsAttendance();
