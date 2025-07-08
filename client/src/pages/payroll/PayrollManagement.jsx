import { useState } from 'react';
import Button from '../../components/common/Button';

const PayrollManagement = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Payroll Management
        </h1>
        <Button variant="primary">
          Generate Payroll
        </Button>
      </div>

      {/* Month Selector */}
      <div className="card p-6">
        <div className="flex items-center space-x-4">
          <label htmlFor="month" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Month:
          </label>
          <input
            type="month"
            id="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* Payroll Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 bg-blue-50 dark:bg-blue-900">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Total Payroll
          </h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
            $45,000
          </p>
        </div>
        <div className="card p-6 bg-green-50 dark:bg-green-900">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
            Employees Processed
          </h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-300">
            156
          </p>
        </div>
        <div className="card p-6 bg-purple-50 dark:bg-purple-900">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
            Average Salary
          </h3>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">
            $2,885
          </p>
        </div>
      </div>

      {/* Payroll List */}
      <div className="card p-6">
        <p className="text-gray-600 dark:text-gray-400">
          Payroll list and detailed calculations will be implemented here.
        </p>
      </div>
    </div>
  );
};

export default PayrollManagement;
