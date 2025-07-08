import { useState } from 'react';
import Button from '../../components/common/Button';

const PayrollHistory = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const mockPayrollHistory = [
    { month: 'March 2024', amount: '$45,000', status: 'Completed', date: '2024-03-31' },
    { month: 'February 2024', amount: '$44,500', status: 'Completed', date: '2024-02-29' },
    { month: 'January 2024', amount: '$43,800', status: 'Completed', date: '2024-01-31' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Payroll History
        </h1>
        <div className="flex items-center space-x-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="input"
          >
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
            <option value={2022}>2022</option>
          </select>
          <Button variant="outline">
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 bg-blue-50 dark:bg-blue-900">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Total Paid (YTD)
          </h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
            $133,300
          </p>
        </div>
        <div className="card p-6 bg-green-50 dark:bg-green-900">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
            Payrolls Processed
          </h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-300">
            3
          </p>
        </div>
        <div className="card p-6 bg-purple-50 dark:bg-purple-900">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
            Average Monthly
          </h3>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">
            $44,433
          </p>
        </div>
      </div>

      {/* Payroll History Table */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Payroll Records
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Processed Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {mockPayrollHistory.map((record, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {record.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {record.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {record.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400">
                        View
                      </button>
                      <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400">
                        Download
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

export default PayrollHistory;
