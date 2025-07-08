import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import AdminRegister from '../pages/auth/AdminRegister';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import ChangePassword from '../pages/auth/ChangePassword';

// Dashboard
import Dashboard from '../pages/dashboard/Dashboard';

// Employee Pages
import EmployeeList from '../pages/employees/EmployeeList';
import AddEmployee from '../pages/employees/AddEmployee';
import EditEmployee from '../pages/employees/EditEmployee';
import EmployeeDetails from '../pages/employees/EmployeeDetails';

// Attendance Pages
import AttendanceManagement from '../pages/attendance/AttendanceManagement';
import AttendanceReport from '../pages/attendance/AttendanceReport';
import RequestHistory from '../pages/attendance/RequestHistory';

// Leave Pages
import LeaveManagement from '../pages/leave/LeaveManagement';
import LeaveRequests from '../pages/leave/LeaveRequests';
import LeaveCalendar from '../pages/leave/LeaveCalendar';
import OnDuty from '../pages/leave/OnDuty';

// Payroll Pages
import PayrollManagement from '../pages/payroll/PayrollManagement';
import PayrollGeneration from '../pages/payroll/PayrollGeneration';
import PayrollHistory from '../pages/payroll/PayrollHistory';

// Profile Pages
import Profile from '../pages/profile/Profile';
import AdminProfile from '../pages/profile/AdminProfileNew';
import ProfileRouter from '../components/ProfileRouter';
import Settings from '../pages/profile/Settings';

// Reports
import Reports from '../pages/reports/Reports';

// Management Pages
import Complaints from '../pages/management/Complaints';
import OfficeCircular from '../pages/management/OfficeCircular';

// Error Pages
import NotFound from '../pages/error/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/register" element={<AdminRegister />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/change-password" element={<ChangePassword />} />
      
      {/* Private Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Dashboard */}
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager', 'employee']}>
            <Dashboard />
          </PrivateRoute>
        } 
      />

      {/* Employee Management */}
      <Route 
        path="/employees" 
        element={
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager']}>
            <EmployeeList />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/employees/add" 
        element={
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager']}>
            <AddEmployee />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/employees/edit/:id" 
        element={
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager']}>
            <EditEmployee />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/employees/:id" 
        element={
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager']}>
            <EmployeeDetails />
          </PrivateRoute>
        } 
      />

      {/* Attendance Management */}
      <Route 
        path="/attendance" 
        element={
          <PrivateRoute allowedRoles={['admin', 'hr', 'employee']}>
            <AttendanceManagement />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/attendance/report" 
        element={
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager']}>
            <AttendanceReport />
          </PrivateRoute>
        } 
      />

      {/* Request History */}
      <Route 
        path="/request-history" 
        element={
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager', 'employee']}>
            <RequestHistory />
          </PrivateRoute>
        } 
      />

      {/* Leave Management */}
      <Route 
        path="/leave" 
        element={
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager', 'employee']}>
            <LeaveManagement />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/leave/requests" 
        element={
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager']}>
            <LeaveRequests />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/leave/calendar" 
        element={
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager', 'employee']}>
            <LeaveCalendar />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/onduty" 
        element={
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager', 'employee']}>
            <OnDuty />
          </PrivateRoute>
        } 
      />

      {/* Payroll Management */}
      <Route 
        path="/payroll" 
        element={
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager']}>
            <PayrollManagement />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/payroll/generate" 
        element={
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager']}>
            <PayrollGeneration />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/payroll/history" 
        element={
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager']}>
            <PayrollHistory />
          </PrivateRoute>
        } 
      />

      {/* Reports */}
      <Route 
        path="/reports" 
        element={
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager']}>
            <Reports />
          </PrivateRoute>
        } 
      />

      {/* Management */}
      <Route 
        path="/complaints" 
        element={
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager', 'employee']}>
            <Complaints />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/office-circular" 
        element={
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager', 'employee']}>
            <OfficeCircular />
          </PrivateRoute>
        } 
      />

      {/* Profile & Settings */}
      <Route 
        path="/profile" 
        element={
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager', 'employee']}>
            <ProfileRouter />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/profile/edit" 
        element={
          <PrivateRoute allowedRoles={['admin', 'hr_manager']}>
            <AdminProfile />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager', 'employee']}>
            <Settings />
          </PrivateRoute>
        } 
      />

      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
