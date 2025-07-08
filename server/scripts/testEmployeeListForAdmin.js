const axios = require('axios');

async function testEmployeeListForAdmin() {
  try {
    console.log('🧪 Testing Employee List for Admin User...');
    
    // First, login as Admin user
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@hrm.com',
      password: 'admin123'
    });
    
    console.log('✅ Admin Login successful');
    const token = loginResponse.data.token;
    
    // Now fetch employees using the Admin token
    const employeesResponse = await axios.get('http://localhost:5001/api/employees', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('✅ Employee list fetched successfully');
    console.log(`📊 Found ${employeesResponse.data.data.length} users`);
    
    // Display user details grouped by role
    const users = employeesResponse.data.data;
    const groupedUsers = users.reduce((acc, user) => {
      if (!acc[user.role]) acc[user.role] = [];
      acc[user.role].push(user);
      return acc;
    }, {});
    
    Object.keys(groupedUsers).forEach(role => {
      console.log(`\n📋 ${role.toUpperCase()}S (${groupedUsers[role].length}):`);
      groupedUsers[role].forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.firstName} ${user.lastName} (${user.employeeCode}) - ${user.department || 'N/A'}`);
      });
    });
    
    console.log('\n🎉 Admin can successfully view all users!');
    
  } catch (error) {
    console.error('❌ Error testing employee list for Admin:', error.response?.data || error.message);
  }
}

testEmployeeListForAdmin();
