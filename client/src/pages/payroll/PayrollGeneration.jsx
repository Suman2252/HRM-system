import { useState } from 'react';
import Button from '../../components/common/Button';

const PayrollGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const handleGeneratePayroll = async () => {
    setLoading(true);
    // Payroll generation logic will be implemented here
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Generate Payroll
      </h1>

      <div className="card p-6">
        <div className="space-y-6">
          {/* Month Selection */}
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Month
            </label>
            <input
              type="month"
              id="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="input"
            />
          </div>

          {/* Configuration Options */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Payroll Configuration
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="include-bonus"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="include-bonus" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Include Performance Bonus
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="include-overtime"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="include-overtime" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Calculate Overtime
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="include-deductions"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="include-deductions" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Apply Standard Deductions
                </label>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Preview Summary
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Employees
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    156
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Estimated Total
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    $45,000
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              variant="primary"
              loading={loading}
              onClick={handleGeneratePayroll}
              fullWidth
            >
              Generate Payroll
            </Button>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollGeneration;
