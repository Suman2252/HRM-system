import { Clock, Calendar, TrendingUp, TrendingDown, Users, Target, Award, AlertCircle, CheckCircle } from 'lucide-react';

const RequestHistory = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 md:p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Request History</h1>
              <p className="text-purple-100 text-lg">View and track your attendance requests</p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <Clock className="w-8 h-8 mb-2" />
                <div className="text-sm text-purple-100">Total Requests</div>
                <div className="text-xl font-bold">12</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Request Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Request Card 1 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Late Arrival Request</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Traffic delay on highway</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">Approved</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600 dark:text-gray-400">
              <p>Date: Jan 18, 2024</p>
              <p>Time: 09:30 AM</p>
            </div>
            <div className="text-right">
              <p className="text-gray-900 dark:text-white font-medium">+30 min</p>
              <p className="text-gray-500 dark:text-gray-400">2 days ago</p>
            </div>
          </div>
        </div>

        {/* Request Card 2 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-xl">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Early Leave Request</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Doctor's appointment</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 text-xs font-medium rounded-full">Pending</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600 dark:text-gray-400">
              <p>Date: Jan 19, 2024</p>
              <p>Time: 04:00 PM</p>
            </div>
            <div className="text-right">
              <p className="text-gray-900 dark:text-white font-medium">-2 hours</p>
              <p className="text-gray-500 dark:text-gray-400">1 day ago</p>
            </div>
          </div>
        </div>

        {/* Request Card 3 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Work From Home</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Personal emergency</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-medium rounded-full">Rejected</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600 dark:text-gray-400">
              <p>Date: Jan 15, 2024</p>
              <p>Time: Full Day</p>
            </div>
            <div className="text-right">
              <p className="text-gray-900 dark:text-white font-medium">8 hours</p>
              <p className="text-gray-500 dark:text-gray-400">5 days ago</p>
            </div>
          </div>
        </div>

        {/* More Request Cards... */}
      </div>
    </div>
  );
};

export default RequestHistory;
