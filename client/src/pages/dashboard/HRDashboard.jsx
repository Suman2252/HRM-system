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
import DashboardCard from '../../components/dashboard/DashboardCard';

const HRDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
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
        
        setStats({
          employees: 156,
          attendance: 89,
          leaves: 12,
          payroll: 45000
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const getDashboardCards = () => {
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
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // HR Dashboard Layout - Same as Admin
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
          <DashboardCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            bgColor={card.bgColor}
            change={card.change}
            changeType={card.changeType}
          />
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
              { title: 'Add Employee', href: '/employees/add', icon: Users },
              { title: 'View Reports', href: '/reports', icon: BarChart3 },
              { title: 'Process Payroll', href: '/payroll/generate', icon: DollarSign },
              { title: 'Leave Requests', href: '/leave/requests', icon: Calendar }
            ].map((action, index) => (
              <Link
                key={index}
                to={action.href}
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

export default HRDashboard;
