import { Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Layout from '../components/layout/Layout';

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

// Analytics Pages
import EmployeeAnalytics from '../pages/analytics/EmployeeAnalytics';

// Management Pages
import Complaints from '../pages/management/Complaints';
import OfficeCircular from '../pages/management/OfficeCircular';

// Error Pages
import NotFound from '../pages/error/NotFound';

export const routes = [
  // Public Routes (no layout)
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/admin/register",
    element: <AdminRegister />
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />
  },
  {
    path: "/reset-password",
    element: <ResetPassword />
  },
  {
    path: "/change-password",
    element: <ChangePassword />
  },
  
  // Private Routes (with layout)
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      
      // Dashboard
      {
        path: "dashboard",
        element: (
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager', 'employee']}>
            <Dashboard />
          </PrivateRoute>
        )
      },

      // Employee Management
      {
        path: "employees",
        element: (
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager']}>
            <EmployeeList />
          </PrivateRoute>
        )
      },
      {
        path: "employees/add",
        element: (
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager']}>
            <AddEmployee />
          </PrivateRoute>
        )
      },
      {
        path: "employees/edit/:id",
        element: (
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager']}>
            <EditEmployee />
          </PrivateRoute>
        )
      },
      {
        path: "employees/:id",
        element: (
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager']}>
            <EmployeeDetails />
          </PrivateRoute>
        )
      },

      // Attendance Management
      {
        path: "attendance",
        element: (
          <PrivateRoute allowedRoles={['admin', 'hr', 'employee']}>
            <AttendanceManagement />
          </PrivateRoute>
        )
      },
      {
        path: "attendance/report",
        element: (
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager']}>
            <AttendanceReport />
          </PrivateRoute>
        )
      },

      // Request History
      {
        path: "request-history",
        element: (
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager', 'employee']}>
            <RequestHistory />
          </PrivateRoute>
        )
      },

      // Leave Management
      {
        path: "leave",
        element: (
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager', 'employee']}>
            <LeaveManagement />
          </PrivateRoute>
        )
      },
      {
        path: "leave/requests",
        element: (
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager']}>
            <LeaveRequests />
          </PrivateRoute>
        )
      },
      {
        path: "leave/calendar",
        element: (
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager', 'employee']}>
            <LeaveCalendar />
          </PrivateRoute>
        )
      },
      {
        path: "onduty",
        element: (
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager', 'employee']}>
            <OnDuty />
          </PrivateRoute>
        )
      },

      // Payroll Management
      {
        path: "payroll",
        element: (
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager']}>
            <PayrollManagement />
          </PrivateRoute>
        )
      },
      {
        path: "payroll/generate",
        element: (
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager']}>
            <PayrollGeneration />
          </PrivateRoute>
        )
      },
      {
        path: "payroll/history",
        element: (
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager']}>
            <PayrollHistory />
          </PrivateRoute>
        )
      },

      // Reports
      {
        path: "reports",
        element: (
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager']}>
            <Reports />
          </PrivateRoute>
        )
      },

      // Analytics
      {
        path: "analytics/employee",
        element: (
          <PrivateRoute allowedRoles={['admin', 'hr_manager']}>
            <EmployeeAnalytics />
          </PrivateRoute>
        )
      },

      // Management
      {
        path: "complaints",
        element: (
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager', 'employee']}>
            <Complaints />
          </PrivateRoute>
        )
      },
      {
        path: "office-circular",
        element: (
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager', 'employee']}>
            <OfficeCircular />
          </PrivateRoute>
        )
      },

      // Profile & Settings
      {
        path: "profile",
        element: (
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager', 'employee']}>
            <ProfileRouter />
          </PrivateRoute>
        )
      },
      {
        path: "profile/edit",
        element: (
          <PrivateRoute allowedRoles={['admin', 'hr_manager']}>
            <AdminProfile />
          </PrivateRoute>
        )
      },
      {
        path: "settings",
        element: (
          <PrivateRoute allowedRoles={['admin', 'hr', 'hr_manager', 'employee']}>
            <Settings />
          </PrivateRoute>
        )
      }
    ]
  },

  // 404 Not Found
  {
    path: "*",
    element: <NotFound />
  }
];
