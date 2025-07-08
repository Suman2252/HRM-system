import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp,
  Users,
  Clock,
  Calendar,
  DollarSign,
  BarChart3,
  FileText,
  Bell,
  CheckCircle,
  AlertCircle,
  Eye,
  Activity,
  Target,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

// Employee Profile Card Component
const EmployeeProfileCard = ({ user }) => (
  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-6 border border-indigo-100 dark:border-gray-700">
    <div className="text-center">
      <div className="relative inline-block">
        <img
          src={user?.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
        />
        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-4">
        {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Employee Name'}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{user?.designation || 'Employee'}</p>
      
      <div className="mt-4 space-y-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Employee ID</span>
            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{user?.employeeCode || 'N/A'}</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Department</span>
            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{user?.department || 'Unassigned'}</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Role</span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{user?.role?.replace('_', ' ').toUpperCase() || 'Employee'}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Modern Stats Card Component
const ModernStatsCard = ({ title, value, subtitle, icon: Icon, color, bgGradient, trend, trendValue }) => (
  <div className={`${bgGradient} rounded-2xl shadow-lg p-6 border border-opacity-20 ${color.border} transform hover:scale-105 transition-all duration-300`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color.iconBg}`}>
        <Icon className={`w-6 h-6 ${color.icon}`} />
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-medium ${color.badge}`}>
        {trend && (
          <span className={`flex items-center ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
            {trend === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
            {trendValue}
          </span>
        )}
      </div>
    </div>
    
    <div className="space-y-2">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </h3>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {title}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState({});
  const [attendanceData, setAttendanceData] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({});
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Fetch dashboard overview data
  const fetchDashboardData = async () => {
    try {
      if (user?.role === 'admin' || user?.role === 'hr_manager') {
        const response = await axios.get('/api/analytics/dashboard/overview');
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Fetch employee attendance data
  const fetchAttendanceData = async () => {
    try {
      const response = await axios.get('/api/attendance', {
        params: {
          startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        }
      });
      setAttendanceData(response.data.data || []);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    }
  };

  // Fetch leave balance
  const fetchLeaveBalance = async () => {
    try {
      const response = await axios.get('/api/leave/balance');
      setLeaveBalance(response.data.data);
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    }
  };

  // Fetch today's attendance
  const fetchTodayAttendance = async () => {
    try {
      const response = await axios.get('/api/attendance/today');
      setTodayAttendance(response.data.data);
    } catch (error) {
      console.error('Error fetching today\'s attendance:', error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications', {
        params: { limit: 5 }
      });
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchDashboardData(),
          fetchAttendanceData(),
          fetchLeaveBalance(),
          fetchTodayAttendance(),
          fetchNotifications()
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Calculate attendance rate for current month
  const calculateAttendanceRate = () => {
    if (!attendanceData.length) return 0;
    const presentDays = attendanceData.filter(record => 
      record.status === 'present' || record.status === 'late'
    ).length;
    return Math.round((presentDays / attendanceData.length) * 100);
  };

  // Calculate total leave balance
  const getTotalLeaveBalance = () => {
    if (!leaveBalance || typeof leaveBalance !== 'object') return 0;
    return Object.values(leaveBalance).reduce((total, leave) => {
      return total + (leave?.remaining || 0);
    }, 0);
  };

  // Calculate leaves used this year
  const getLeavesUsed = () => {
    if (!leaveBalance || typeof leaveBalance !== 'object') return 0;
    return Object.values(leaveBalance).reduce((total, leave) => {
      return total + (leave?.used || 0);
    }, 0);
  };

  // Modern Attendance Chart Component
  const ModernAttendanceChart = () => {
    // Process attendance data for chart
    const last12Months = [];
    const attendanceCounts = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      last12Months.push(monthName);
      
      // Count attendance for this month (mock data for now)
      const count = Math.floor(Math.random() * 5) + 20; // 20-25 days
      attendanceCounts.push(count);
    }

    const chartData = {
      labels: last12Months,
      datasets: [{
        label: 'Days Present',
        data: attendanceCounts,
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#6366F1',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#6B7280'
          }
        },
        y: {
          beginAtZero: true,
          max: 30,
          grid: {
            color: '#F3F4F6'
          },
          ticks: {
            stepSize: 5,
            color: '#6B7280'
          }
        }
      }
    };

    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-6 border border-blue-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Attendance Overview
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Monthly attendance tracking
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {attendanceData.filter(r => r.status === 'present' || r.status === 'late').length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">This Month</div>
          </div>
        </div>
        <div className="h-64">
          <Line data={chartData} options={options} />
        </div>
      </div>
    );
  };

  // Recent Activities Component
  const RecentActivities = () => (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-6 border border-emerald-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Recent Activities
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Latest updates and notifications
          </p>
        </div>
        <Link to="/notifications" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
          View All
        </Link>
      </div>
      
      <div className="space-y-4">
        {notifications.length > 0 ? notifications.slice(0, 4).map((notification, index) => (
          <div key={notification._id || index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-start space-x-3">
              <div className={`w-3 h-3 rounded-full mt-2 ${
                notification.type === 'leave_request' ? 'bg-blue-500' :
                notification.type === 'payroll_generated' ? 'bg-green-500' :
                notification.type === 'leave_approved' ? 'bg-emerald-500' :
                notification.type === 'leave_rejected' ? 'bg-red-500' :
                'bg-gray-500'
              }`}></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </p>
              </div>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          </div>
        )) : (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No recent activities</p>
          </div>
        )}
      </div>
    </div>
  );

  // Tab Navigation Component
  const TabNavigation = () => {
    const tabs = [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'activities', label: 'Activities', icon: Activity },
      { id: 'attendance', label: 'Attendance', icon: Clock }
    ];

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-2 mb-6">
        <div className="flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Dashboard Tab Content
  const DashboardContent = () => (
    <>
      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        <ModernStatsCard
          title="Attendance Rate"
          value={`${calculateAttendanceRate()}%`}
          subtitle="This month"
          icon={Clock}
          color={{
            icon: 'text-emerald-600',
            iconBg: 'bg-emerald-100',
            badge: 'bg-emerald-100 text-emerald-700',
            border: 'border-emerald-200'
          }}
          bgGradient="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-gray-800 dark:to-gray-900"
          trend="up"
          trendValue="+5%"
        />
        <ModernStatsCard
          title="Leave Balance"
          value={`${getTotalLeaveBalance()} Days`}
          subtitle="Available"
          icon={Calendar}
          color={{
            icon: 'text-blue-600',
            iconBg: 'bg-blue-100',
            badge: 'bg-blue-100 text-blue-700',
            border: 'border-blue-200'
          }}
          bgGradient="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900"
        />
        <ModernStatsCard
          title="Leaves Used"
          value={`${getLeavesUsed()}`}
          subtitle="This year"
          icon={Target}
          color={{
            icon: 'text-purple-600',
            iconBg: 'bg-purple-100',
            badge: 'bg-purple-100 text-purple-700',
            border: 'border-purple-200'
          }}
          bgGradient="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900"
        />
        <ModernStatsCard
          title="Today's Status"
          value={todayAttendance?.status ? 
            todayAttendance.status.charAt(0).toUpperCase() + todayAttendance.status.slice(1) : 
            'Absent'
          }
          subtitle={todayAttendance?.hasCheckedIn ? 
            (todayAttendance?.hasCheckedOut ? 'Completed' : 'Present') : 
            'Not checked in'
          }
          icon={CheckCircle}
          color={{
            icon: 'text-orange-600',
            iconBg: 'bg-orange-100',
            badge: 'bg-orange-100 text-orange-700',
            border: 'border-orange-200'
          }}
          bgGradient="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-900"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Left Column - Profile & Quick Actions */}
        <div className="lg:col-span-3 space-y-6">
          <EmployeeProfileCard user={user} />
          
          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-6 border border-rose-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { label: 'Apply for Leave', icon: Calendar, color: 'from-blue-500 to-cyan-500', to: '/leave' },
                { label: 'View Attendance', icon: Clock, color: 'from-green-500 to-emerald-500', to: '/attendance' },
                { label: 'View Payslip', icon: DollarSign, color: 'from-purple-500 to-pink-500', to: '/payroll' },
                { label: 'Update Profile', icon: Users, color: 'from-orange-500 to-red-500', to: '/profile' }
              ].map((action, index) => (
                <Link
                  key={index}
                  to={action.to}
                  className={`w-full flex items-center p-3 bg-gradient-to-r ${action.color} text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                >
                  <action.icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column - Charts and Analytics */}
        <div className="lg:col-span-6 space-y-6">
          <ModernAttendanceChart />
          
          {/* Work Hours Summary */}
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Work Hours Summary</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { 
                  label: 'Today', 
                  value: todayAttendance?.totalHours ? `${todayAttendance.totalHours}h` : '0h', 
                  color: 'text-green-600', 
                  bg: 'bg-green-50' 
                },
                { 
                  label: 'This Month', 
                  value: attendanceData.reduce((sum, record) => sum + (parseFloat(record.workingHours) || 0), 0).toFixed(1) + 'h', 
                  color: 'text-blue-600', 
                  bg: 'bg-blue-50' 
                },
                { 
                  label: 'Overtime', 
                  value: attendanceData.reduce((sum, record) => sum + (parseFloat(record.overtimeHours) || 0), 0).toFixed(1) + 'h', 
                  color: 'text-purple-600', 
                  bg: 'bg-purple-50' 
                },
                { 
                  label: 'Average', 
                  value: attendanceData.length > 0 ? 
                    (attendanceData.reduce((sum, record) => sum + (parseFloat(record.workingHours) || 0), 0) / attendanceData.length).toFixed(1) + 'h' : 
                    '0h', 
                  color: 'text-orange-600', 
                  bg: 'bg-orange-50' 
                }
              ].map((item, index) => (
                <div key={index} className={`${item.bg} dark:bg-gray-800 rounded-xl p-4 text-center`}>
                  <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Activities */}
        <div className="lg:col-span-3">
          <RecentActivities />
        </div>
      </div>
    </>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Employee Dashboard Layout
  if (user?.role === 'employee') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-6">
        {/* Welcome Header */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl p-6 md:p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {user?.firstName || 'Employee'}! 👋
                </h1>
                <p className="text-indigo-100 text-lg">
                  Ready to make today productive?
                </p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <div className="text-2xl font-bold">
                    {todayAttendance?.status ? 
                      todayAttendance.status.charAt(0).toUpperCase() + todayAttendance.status.slice(1) : 
                      'Absent'
                    }
                  </div>
                  <div className="text-sm text-indigo-100">Today's Status</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <TabNavigation />

        {/* Tab Content */}
        {activeTab === 'dashboard' && <DashboardContent />}
        {activeTab === 'activities' && (
          <div className="grid grid-cols-1 gap-6">
            <RecentActivities />
          </div>
        )}
        {activeTab === 'attendance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ModernAttendanceChart />
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Attendance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <span className="text-sm font-medium">Today's Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    todayAttendance?.status === 'present' ? 'bg-green-100 text-green-800' :
                    todayAttendance?.status === 'late' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {todayAttendance?.status ? 
                      todayAttendance.status.charAt(0).toUpperCase() + todayAttendance.status.slice(1) : 
                      'Absent'
                    }
                  </span>
                </div>
                <Link 
                  to="/attendance" 
                  className="block w-full bg-indigo-600 text-white text-center py-3 rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  View Full Attendance
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Admin/HR Dashboard Layout
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-heading font-bold mb-2">
          Welcome back, {user?.firstName || 'Admin'}!
        </h1>
        <p className="text-primary-100">
          Here's what's happening with your team today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="dashboard-card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Employees
              </p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {dashboardData.totalEmployees || 0}
                </p>
                <span className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +{dashboardData.newEmployeesThisMonth || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-green-100 dark:bg-green-900">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Attendance Rate
              </p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {dashboardData.attendanceRate || 0}%
                </p>
                <span className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +5%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Pending Leaves
              </p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {dashboardData.pendingLeaves || 0}
                </p>
                <span className="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Pending
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Payroll Status
              </p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {dashboardData.payroll?.generated || 0}/{dashboardData.payroll?.paid || 0}
                </p>
                <span className="ml-2 flex items-baseline text-sm font-semibold text-blue-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Processed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {dashboardData.recentActivities?.slice(0, 4).map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-primary-500 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(activity.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )) || (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No recent activities</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: 'Add Employee', to: '/employees/add', icon: Users },
              { title: 'View Reports', to: '/reports', icon: BarChart3 },
              { title: 'Process Payroll', to: '/payroll/generate', icon: DollarSign },
              { title: 'Leave Requests', to: '/leave/requests', icon: Calendar }
            ].map((action, index) => (
              <Link
                key={index}
                to={action.to}
                className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <action.icon className="h-8 w-8 text-primary-600 dark:text-primary-400 mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-center">
                  {action.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Attendance Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Attendance Overview
          </h3>
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              Real-time attendance chart
            </p>
          </div>
        </div>

        {/* Leave Trends */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Leave Trends
          </h3>
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              Real-time leave trends chart
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
