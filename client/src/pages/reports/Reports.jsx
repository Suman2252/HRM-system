import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Clock, 
  Calendar,
  Download,
  Filter,
  TrendingUp,
  DollarSign,
  FileText,
  Eye,
  Search,
  RefreshCw
} from 'lucide-react';
import Button from '../../components/common/Button';
import employeeStore from '../../utils/employeeStore';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('employees');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const reports = [
    {
      id: 'employees',
      name: 'Employee Report',
      icon: Users,
      description: 'View comprehensive employee statistics and demographics',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600'
    },
    {
      id: 'attendance',
      name: 'Attendance Report',
      icon: Clock,
      description: 'Analyze attendance patterns and trends',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600'
    },
    {
      id: 'leave',
      name: 'Leave Report',
      icon: Calendar,
      description: 'Track leave statistics and patterns',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-600'
    },
    {
      id: 'payroll',
      name: 'Payroll Report',
      icon: DollarSign,
      description: 'Analyze payroll expenses and trends',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600'
    },
    {
      id: 'performance',
      name: 'Performance Report',
      icon: BarChart3,
      description: 'Evaluate employee performance metrics',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      iconColor: 'text-indigo-600'
    },
    {
      id: 'custom',
      name: 'Custom Report',
      icon: FileText,
      description: 'Create custom reports with specific parameters',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      iconColor: 'text-pink-600'
    }
  ];

  const generateReport = async () => {
    setIsGenerating(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    console.log('Generating report:', selectedReport, dateRange);
    // In a real app, this would generate and download the report
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const employeeData = await employeeStore.getAllEmployees();
        setEmployees(employeeData || []);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const getEmployeeStats = () => {
    const departments = {};
    const positions = {};
    let totalSalary = 0;

    employees.forEach(emp => {
      // Count by department
      departments[emp.department || 'Unknown'] = (departments[emp.department || 'Unknown'] || 0) + 1;
      // Count by position
      positions[emp.position || emp.designation || 'Unknown'] = (positions[emp.position || emp.designation || 'Unknown'] || 0) + 1;
      // Sum salaries
      totalSalary += Number(emp.salary || 0);
    });

    return {
      total: employees.length,
      departments,
      positions,
      totalSalary,
      averageSalary: employees.length ? totalSalary / employees.length : 0
    };
  };

  const stats = getEmployeeStats();

  const quickStats = [
    {
      title: 'Total Employees',
      value: stats.total,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      change: '+12%'
    },
    {
      title: 'Active Reports',
      value: '24',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
      change: '+8%'
    },
    {
      title: 'Avg Salary',
      value: `$${Math.round(stats.averageSalary).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      change: '+5%'
    },
    {
      title: 'Departments',
      value: Object.keys(stats.departments).length,
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
      change: '+2%'
    }
  ];

  const selectedReportData = reports.find(r => r.id === selectedReport);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Reports Dashboard
            </h1>
            <p className="text-primary-100">
              Generate comprehensive reports and analyze your HR data
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-primary-100">Total Employees</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.title}
                </p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                  <span className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Types */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Select Report Type
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                selectedReport === report.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:shadow-md'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg ${report.bgColor} flex items-center justify-center mb-4`}>
                <report.icon className={`h-6 w-6 ${report.iconColor}`} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {report.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {report.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Report Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Report Configuration
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selected Report
              </label>
              <div className={`p-4 rounded-lg ${selectedReportData?.bgColor} border border-gray-200 dark:border-gray-700`}>
                <div className="flex items-center">
                  <selectedReportData.icon className={`h-5 w-5 ${selectedReportData?.iconColor} mr-3`} />
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedReportData?.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={generateReport}
                disabled={isGenerating}
                className="flex items-center space-x-2 flex-1"
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span>{isGenerating ? 'Generating...' : 'Generate Report'}</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Report Preview */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Report Preview
          </h2>
          
          {selectedReport === 'employees' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Employees</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">${Math.round(stats.totalSalary).toLocaleString()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Payroll</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Department Distribution</h4>
                <div className="space-y-2">
                  {Object.entries(stats.departments).map(([dept, count]) => (
                    <div key={dept} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{dept}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{count} employees</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="text-center">
                <selectedReportData.icon className={`h-12 w-12 ${selectedReportData?.iconColor} mx-auto mb-4`} />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {selectedReportData?.name} Preview
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Configure date range and generate report to see preview
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Recent Reports
          </h2>
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Search Reports</span>
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Report Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Generated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {[
                { name: 'Monthly Employee Report', type: 'Employee', date: '2024-01-15', status: 'Completed' },
                { name: 'Q4 Attendance Analysis', type: 'Attendance', date: '2024-01-10', status: 'Completed' },
                { name: 'Leave Trends Report', type: 'Leave', date: '2024-01-08', status: 'Completed' },
                { name: 'Payroll Summary', type: 'Payroll', date: '2024-01-05', status: 'Processing' }
              ].map((report, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {report.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {report.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {report.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      report.status === 'Completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex space-x-2">
                      <button className="text-primary-600 hover:text-primary-900">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="text-primary-600 hover:text-primary-900">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
