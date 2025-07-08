import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Users, TrendingUp, TrendingDown, UserCheck, UserX } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

const EmployeeAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    demographics: null,
    turnover: null,
    headcount: null,
    satisfaction: null
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch all analytics data
      const [demographics, turnover, headcount, satisfaction] = await Promise.all([
        fetch('/api/analytics/employee/demographics').then(res => res.json()),
        fetch(`/api/analytics/employee/turnover?period=${selectedPeriod}`).then(res => res.json()),
        fetch(`/api/analytics/employee/headcount-trends?period=${selectedPeriod}`).then(res => res.json()),
        fetch('/api/analytics/employee/satisfaction').then(res => res.json())
      ]);

      setAnalytics({
        demographics: demographics.data,
        turnover: turnover.data,
        headcount: headcount.data,
        satisfaction: satisfaction.data
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const departmentChartData = {
    labels: analytics.demographics?.departments?.map(d => d.name) || [],
    datasets: [
      {
        label: 'Employees',
        data: analytics.demographics?.departments?.map(d => d.count) || [],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#06B6D4',
          '#84CC16'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  const turnoverChartData = {
    labels: analytics.turnover?.months || [],
    datasets: [
      {
        label: 'Turnover Rate (%)',
        data: analytics.turnover?.rates || [],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Industry Average (%)',
        data: analytics.turnover?.industryAverage || [],
        borderColor: '#6B7280',
        backgroundColor: 'rgba(107, 114, 128, 0.1)',
        borderDash: [5, 5],
        tension: 0.4
      }
    ]
  };

  const headcountChartData = {
    labels: analytics.headcount?.months || [],
    datasets: [
      {
        label: 'Total Employees',
        data: analytics.headcount?.total || [],
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 2
      },
      {
        label: 'New Hires',
        data: analytics.headcount?.newHires || [],
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 2
      },
      {
        label: 'Departures',
        data: analytics.headcount?.departures || [],
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Employee Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive insights into your workforce
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input"
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
            <option value="2years">Last 2 Years</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Employees
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.demographics?.totalEmployees || 0}
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +{analytics.demographics?.growthRate || 0}% this month
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Turnover Rate
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.turnover?.currentRate || 0}%
              </p>
              <p className="text-sm text-red-600 flex items-center mt-1">
                <TrendingDown className="h-4 w-4 mr-1" />
                {analytics.turnover?.trend || 0}% vs last month
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
              <UserX className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Retention Rate
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.demographics?.retentionRate || 0}%
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +{analytics.demographics?.retentionTrend || 0}% vs last quarter
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Satisfaction Score
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.satisfaction?.averageScore || 0}/5
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +{analytics.satisfaction?.improvement || 0}% improvement
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Department Distribution
          </h3>
          <div className="h-80">
            <Pie data={departmentChartData} options={pieOptions} />
          </div>
        </div>

        {/* Turnover Trends */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Turnover Trends
          </h3>
          <div className="h-80">
            <Line data={turnoverChartData} options={chartOptions} />
          </div>
        </div>

        {/* Headcount Trends */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Headcount Trends
          </h3>
          <div className="h-80">
            <Bar data={headcountChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Demographics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Age Distribution
          </h3>
          <div className="space-y-3">
            {analytics.demographics?.ageGroups?.map((group, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {group.range}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${group.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {group.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Gender Distribution
          </h3>
          <div className="space-y-3">
            {analytics.demographics?.gender?.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.type}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Experience Distribution
          </h3>
          <div className="space-y-3">
            {analytics.demographics?.experience?.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.range}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAnalytics;
