import { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const AttendanceManagement = () => {
  const { user } = useAuth();
  const [currentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [entriesPerPage, setEntriesPerPage] = useState('10');
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({});
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Fetch attendance data
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range for selected month/year
      const monthIndex = monthNames.indexOf(selectedMonth);
      const startDate = new Date(parseInt(selectedYear), monthIndex, 1);
      const endDate = new Date(parseInt(selectedYear), monthIndex + 1, 0);
      
      const response = await axios.get('/api/attendance', {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      });
      
      if (response.data) {
        setAttendanceData(response.data.data || []);
        setAttendanceSummary(response.data.summary || {});
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      toast.error('Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch today's attendance status
  const fetchTodayAttendance = async () => {
    try {
      const response = await axios.get('/api/attendance/today');
      if (response.data) {
        setTodayAttendance(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching today\'s attendance:', error);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
    fetchTodayAttendance();
  }, [selectedYear, selectedMonth]);

  // Filter attendance data based on search term
  const filteredData = attendanceData.filter(record => 
    record.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.notes && record.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const totalEntries = filteredData.length;
  const entriesPerPageNum = parseInt(entriesPerPage);
  const totalPages = Math.ceil(totalEntries / entriesPerPageNum);
  const startIndex = (currentPage - 1) * entriesPerPageNum;
  const endIndex = startIndex + entriesPerPageNum;
  const currentEntries = filteredData.slice(startIndex, endIndex);

  const getStatusBadge = (status, isLateCheckIn, isEarlyCheckOut) => {
    let bgColor = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    let icon = <AlertCircle className="w-3 h-3 mr-1" />;
    
    switch (status) {
      case 'present':
        bgColor = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        icon = <CheckCircle className="w-3 h-3 mr-1" />;
        break;
      case 'late':
        bgColor = 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
        icon = <Clock className="w-3 h-3 mr-1" />;
        break;
      case 'half_day':
        bgColor = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        icon = <TrendingDown className="w-3 h-3 mr-1" />;
        break;
      case 'absent':
        bgColor = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        icon = <AlertCircle className="w-3 h-3 mr-1" />;
        break;
    }
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
        {isLateCheckIn && ' (Late)'}
        {isEarlyCheckOut && ' (Early)'}
      </span>
    );
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--';
    try {
      const time = new Date(`1970-01-01T${timeString}`);
      return time.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return timeString;
    }
  };

  const getDayName = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } catch {
      return '--';
    }
  };

  const formatDateDisplay = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Attendance Management</h1>
              <p className="text-blue-100 text-lg">{formatDate(currentDate)}</p>
              <p className="text-blue-200 text-sm mt-1">Current Time: {getCurrentTime()}</p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <Clock className="w-8 h-8 mb-2" />
                <div className="text-sm text-blue-100">Today's Status</div>
                <div className="text-xl font-bold">
                  {todayAttendance?.hasCheckedIn ? 
                    (todayAttendance?.hasCheckedOut ? 'Completed' : 'Present') : 
                    'Not Checked In'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Attendance Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Days</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {attendanceSummary.totalDays || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Present Days</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {attendanceSummary.presentDays || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-5 h-5 text-orange-500" />
            <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Late Days</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {attendanceSummary.lateDays || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-5 h-5 text-purple-500" />
            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Half Days</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {attendanceSummary.halfDays || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-indigo-500" />
            <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Absent Days</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {attendanceSummary.absentDays || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-teal-500" />
            <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Working Hours</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {attendanceSummary.totalWorkingHours || '0.00'}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-cyan-500" />
            <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Overtime Hours</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {attendanceSummary.totalOvertimeHours || '0.00'}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Attendance Rate</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {attendanceSummary.totalDays > 0 ? 
              Math.round((attendanceSummary.presentDays / attendanceSummary.totalDays) * 100) : 0}%
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="w-2 h-2 bg-red-400 rounded-full"></span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Today Status</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {todayAttendance?.status ? 
              todayAttendance.status.charAt(0).toUpperCase() + todayAttendance.status.slice(1) : 
              'Absent'
            }
          </div>
        </div>
      </div>

      {/* My Punch Details Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Punch Details</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track your daily attendance records</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="min-w-[100px] px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option>2025</option>
                <option>2024</option>
                <option>2023</option>
              </select>
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="min-w-[120px] px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                {monthNames.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <Button variant="primary" className="flex items-center gap-2 whitespace-nowrap">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Show</span>
              <select 
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(e.target.value);
                  setCurrentPage(1);
                }}
                className="min-w-[80px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option>10</option>
                <option>25</option>
                <option>50</option>
                <option>100</option>
              </select>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">entries</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search records..."
                  className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <Button variant="secondary" className="flex items-center gap-2 whitespace-nowrap">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">S.No</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">Day</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">In Time</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">Out Time</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">Worked Hours</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">Overtime</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">Remarks</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-gray-500 dark:text-gray-400">Loading attendance records...</p>
                    </div>
                  </td>
                </tr>
              ) : currentEntries.length > 0 ? (
                currentEntries.map((record, index) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <td className="py-4 px-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700">
                      {startIndex + index + 1}
                    </td>
                    <td className="py-4 px-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700">
                      {formatDateDisplay(record.date)}
                    </td>
                    <td className="py-4 px-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700">
                      {getDayName(record.date)}
                    </td>
                    <td className="py-4 px-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700">
                      {record.checkInTime || '--'}
                    </td>
                    <td className="py-4 px-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700">
                      {record.checkOutTime || '--'}
                    </td>
                    <td className="py-4 px-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700">
                      {record.workingHours || '0.00'}h
                    </td>
                    <td className="py-4 px-6 border-b border-gray-100 dark:border-gray-700">
                      {getStatusBadge(record.status, record.isLateCheckIn, record.isEarlyCheckOut)}
                    </td>
                    <td className="py-4 px-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700">
                      {record.overtimeHours || '0.00'}h
                    </td>
                    <td className="py-4 px-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700">
                      {record.notes || '--'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No attendance records found</p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                        {searchTerm ? 'Try adjusting your search criteria' : 'Your punch details will appear here once you start marking attendance'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">{Math.min(endIndex, totalEntries)}</span> of{' '}
              <span className="font-medium">{totalEntries}</span> entries
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg font-medium ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;
