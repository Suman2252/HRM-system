const mongoose = require('mongoose');
const Attendance = require('../models/AttendanceEnhanced');
const User = require('../models/User');

mongoose.connect('mongodb://localhost:27017/hrm_system')
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Find the specific user
  const user = await User.findOne({ email: 'hariharish2604@gmail.com' });
  if (!user) {
    console.log('User not found');
    process.exit(1);
  }
  
  console.log('User found:', user.email, user._id);
  
  // Find attendance records for this user
  const attendanceRecords = await Attendance.find({ userId: user._id }).sort({ date: -1 });
  
  console.log('\n=== ATTENDANCE RECORDS FOR', user.email, '===');
  console.log('Total records found:', attendanceRecords.length);
  
  attendanceRecords.forEach((record, recordIndex) => {
    console.log(`\nRecord ${recordIndex + 1}:`);
    console.log('  ID:', record._id);
    console.log('  Date:', record.date.toISOString().split('T')[0]);
    console.log('  Sessions:', record.sessions.length);
    console.log('  Status:', record.status);
    console.log('  Total Hours:', record.totalHours);
    console.log('  Working Hours:', record.workingHours);
    
    record.sessions.forEach((session, index) => {
      console.log(`    Session ${index + 1}:`);
      console.log(`      Check-in: ${session.checkInTime ? session.checkInTime.toLocaleTimeString() : 'None'}`);
      console.log(`      Check-out: ${session.checkOutTime ? session.checkOutTime.toLocaleTimeString() : 'None'}`);
      console.log(`      Hours: ${session.sessionHours || 0}`);
      console.log(`      Active: ${session.isActive && !session.checkOutTime}`);
      console.log(`      Notes: ${session.notes || 'None'}`);
    });
  });
  
  process.exit(0);
})
.catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
