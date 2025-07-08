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
  Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
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
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
        />
        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-4">
        {user?.name || 'Employee Name'}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Software Developer</p>
      
      <div className="mt-4 space-y-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Experience</span>
            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">1Y 3M</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Department</span>
            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">Engineering</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Employee ID</span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">EMP001</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Modern Stats Card Component
const ModernStatsCard = ({ title, value, subtitle, icon: Icon, color, bgGradient }) => (
  <div className={`${bgGradient} rounded-2xl shadow-lg p-6 border border-opacity-20 ${color.border} transform hover:scale-105 transition-all duration-300`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color.iconBg}`}>
        <Icon className={`w-6 h-6 ${color.icon}`} />
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-medium ${color.badge}`}>
        Active
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
  const [stats, setStats] = useState({
    employees: 0,
    attendance: 0,
    leaves: 0,
    payroll: 0
  });

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      try {
        // In a real app, you would fetch data from your API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (user?.role === 'admin' || user?.role === 'hr' || user?.role === 'hr_manager') {
          setStats({
            employees: 156,
            attendance: 89,
            leaves: 12,
            payroll: 45000
          });
        } else {
          // Employee dashboard stats
          setStats({
            attendance: 22, // days present this month
            leaves: 3,     // leaves taken
            balance: 15,   // remaining leave balance
            pending: 1     // pending requests
          });
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const getDashboardCards = () => {
    if (user?.role === 'admin' || user?.role === 'hr' || user?.role === 'hr_manager') {
      return [
        {
          title: 'Total Employees',
          value: stats.employees,
          icon: Users,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100 dark:bg-blue-900',
          change: '+12%',
          changeType: 'increase'
        },
        {
          title: 'Attendance Rate',
          value: `${stats.attendance}%`,
          icon: Clock,
          color: 'text-green-600',
          bgColor: 'bg-green-100 dark:bg-green-900',
          change: '+5%',
          changeType: 'increase'
        },
        {
          title: 'Pending Leaves',
          value: stats.leaves,
          icon: Calendar,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900',
          change: '-3%',
          changeType: 'decrease'
        },
        {
          title: 'Monthly Payroll',
          value: `$${stats.payroll?.toLocaleString() || '0'}`,
          icon: DollarSign,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100 dark:bg-purple-900',
          change: '+8%',
          changeType: 'increase'
        }
      ];
    } else {
      return [
        {
          title: 'Attendance This Month',
          value: stats.attendance,
          icon: Clock,
          color: 'text-green-600',
          bgColor: 'bg-green-100 dark:bg-green-900',
          change: '22/25 days',
          changeType: 'increase'
        },
        {
          title: 'Leaves Used',
          value: stats.leaves,
          icon: Calendar,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100 dark:bg-orange-900',
          change: 'This year',
          changeType: 'decrease'
        },
        {
          title: 'Leave Balance',
          value: stats.balance,
          icon: Users,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100 dark:bg-blue-900',
          change: 'Remaining',
          changeType: 'increase'
        },
        {
          title: 'Pending Requests',
          value: stats.pending,
          icon: DollarSign,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100 dark:bg-purple-900',
          change: 'Awaiting approval',
          changeType: 'decrease'
        }
      ];
    }
  };

  // Modern Attendance Chart Component
  const ModernAttendanceChart = () => {
    const attendanceData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Days Present',
        data: [22, 20, 23, 25, 24, 22, 26, 23, 21, 24, 22, 20],
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
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">23</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">This Month</div>
          </div>
        </div>
        <div className="h-64">
          <Line data={attendanceData} options={options} />
        </div>
      </div>
    );
  };

  // Modern Task Management Component (without Add Task button)
  const ModernTaskManagement = () => (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-6 border border-emerald-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Today's Tasks
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track your daily progress
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        {[
          { task: 'Frontend Development', progress: 75, status: 'In Progress', color: 'bg-blue-500' },
          { task: 'API Integration', progress: 60, status: 'In Progress', color: 'bg-purple-500' },
          { task: 'Code Review', progress: 90, status: 'Almost Done', color: 'bg-green-500' },
          { task: 'Documentation', progress: 30, status: 'Started', color: 'bg-orange-500' }
        ].map((item, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{item.task}</span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{item.status}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${item.color}`} 
                style={{ width: `${item.progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
              {item.progress}% Complete
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Tab Navigation Component
  const TabNavigation = () => {
    const tabs = [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'dailylog', label: 'Daily Log', icon: FileText },
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
          value="96%"
          subtitle="This month"
          icon={Clock}
          color={{
            icon: 'text-emerald-600',
            iconBg: 'bg-emerald-100',
            badge: 'bg-emerald-100 text-emerald-700',
            border: 'border-emerald-200'
          }}
          bgGradient="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-gray-800 dark:to-gray-900"
        />
        <ModernStatsCard
          title="Leave Balance"
          value="12 Days"
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
          title="Tasks Completed"
          value="8/12"
          subtitle="This week"
          icon={CheckCircle}
          color={{
            icon: 'text-purple-600',
            iconBg: 'bg-purple-100',
            badge: 'bg-purple-100 text-purple-700',
            border: 'border-purple-200'
          }}
          bgGradient="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900"
        />
        <ModernStatsCard
          title="Performance"
          value="Excellent"
          subtitle="Keep it up!"
          icon={TrendingUp}
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
                { label: 'Clock In/Out', icon: Clock, color: 'from-green-500 to-emerald-500', to: '/attendance' },
                { label: 'View Payslip', icon: DollarSign, color: 'from-purple-500 to-pink-500', to: '/payroll/history' },
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
                { label: 'Today', value: '8h 30m', color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'This Week', value: '42h 15m', color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Overtime', value: '2h 15m', color: 'text-purple-600', bg: 'bg-purple-50' },
                { label: 'Average', value: '8h 25m', color: 'text-orange-600', bg: 'bg-orange-50' }
              ].map((item, index) => (
                <div key={index} className={`${item.bg} dark:bg-gray-800 rounded-xl p-4 text-center`}>
                  <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Tasks */}
        <div className="lg:col-span-3">
          <ModernTaskManagement />
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
                  Welcome back, {user?.name}! 👋
                </h1>
                <p className="text-indigo-100 text-lg">
                  Ready to make today productive?
                </p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <div className="text-2xl font-bold">23°C</div>
                  <div className="text-sm text-indigo-100">Perfect weather</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <TabNavigation />

        {/* Tab Content */}
        {activeTab === 'dashboard' && <DashboardContent />}
      </div>
    );
  }

  // Admin/HR Dashboard Layout
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-heading font-bold mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-primary-100">
          Here's what's happening with your team today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {getDashboardCards().map((card, index) => (
          <div key={index} className="dashboard-card">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {card.title}
                </p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {card.value}
                  </p>
                  <span className={`ml-2 flex items-baseline text-sm font-semibold ${
                    card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {card.change}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {[
              { action: 'John Doe clocked in', time: '9:00 AM', type: 'attendance' },
              { action: 'Sarah Smith applied for leave', time: '8:45 AM', type: 'leave' },
              { action: 'Mike Johnson updated profile', time: '8:30 AM', type: 'profile' },
              { action: 'Payroll processed for March', time: '8:00 AM', type: 'payroll' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-primary-500 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
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
        {/* Attendance Chart Placeholder */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Attendance Overview
          </h3>
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              Chart will be implemented with Chart.js
            </p>
          </div>
        </div>

        {/* Leave Trends Placeholder */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Leave Trends
          </h3>
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              Chart will be implemented with Chart.js
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
