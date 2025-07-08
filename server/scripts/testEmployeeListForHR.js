const axios = require('axios');

async function testEmployeeListForHR() {
  try {
    console.log('🧪 Testing Employee List for HR User...');
    
    // First, login as HR user
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'hr@hrm.com',
      password: 'hr123456'
    });
    
    console.log('✅ HR Login successful');
    const token = loginResponse.data.token;
    
    // Now fetch employees using the HR token
    const employeesResponse = await axios.get('http://localhost:5001/api/employees', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('✅ Employee list fetched successfully');
    console.log(`📊 Found ${employeesResponse.data.data.length} employees`);
    
    // Display employee details
    employeesResponse.data.data.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.firstName} ${emp.lastName} (${emp.employeeCode || emp.employeeId}) - ${emp.role} - ${emp.department}`);
    });
    
    console.log('\n🎉 HR can successfully view employee list!');
    
  } catch (error) {
    console.error('❌ Error testing employee list for HR:', error.response?.data || error.message);
  }
}

testEmployeeListForHR();
