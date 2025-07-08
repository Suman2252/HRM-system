import { useState } from 'react';
import { 
  DocumentTextIcon, 
  EyeIcon, 
  ArrowDownTrayIcon as DownloadIcon,
  UserGroupIcon,
  CalendarIcon,
  TagIcon,
  ClockIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const OfficeCircular = () => {
  const [selectedCircular, setSelectedCircular] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleViewCircular = (circular) => {
    setSelectedCircular(circular);
    setIsViewModalOpen(true);
  };

  const [circulars] = useState([
    {
      id: 1,
      title: 'Annual Performance Review Guidelines',
      description: 'Updated guidelines for the upcoming annual performance review cycle.',
      category: 'HR Policy',
      publishedDate: '2024-01-18',
      validUntil: '2024-12-31',
      publishedBy: 'HR Department',
      targetAudience: 'All Employees',
      attachments: 2,
      priority: 'High'
    },
    {
      id: 2,
      title: 'Office Renovation Schedule',
      description: 'Schedule and guidelines for the upcoming office renovation project.',
      category: 'Facilities',
      publishedDate: '2024-01-15',
      validUntil: '2024-02-15',
      publishedBy: 'Facilities Management',
      targetAudience: 'All Departments',
      attachments: 1,
      priority: 'Medium'
    },
    {
      id: 3,
      title: 'New IT Security Protocols',
      description: 'Implementation of new security measures and protocols for IT systems.',
      category: 'IT Security',
      publishedDate: '2024-01-10',
      validUntil: '2024-12-31',
      publishedBy: 'IT Department',
      targetAudience: 'All Staff',
      attachments: 3,
      priority: 'High'
    }
  ]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Medium':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Office Circulars</h1>
              <p className="text-blue-100 text-lg">View and manage official announcements</p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <DocumentTextIcon className="w-8 h-8 mb-2" />
                <div className="text-sm text-blue-100">Total Circulars</div>
                <div className="text-xl font-bold">{circulars.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Circulars Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {circulars.map((circular) => (
          <div key={circular.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-xl">
                  <DocumentTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{circular.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">#{circular.id}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(circular.priority)}`}>
                {circular.priority}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {circular.description}
            </p>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <TagIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500 dark:text-gray-400">Category:</span>
                <span className="text-gray-900 dark:text-white font-medium">{circular.category}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <UserGroupIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500 dark:text-gray-400">Target:</span>
                <span className="text-gray-900 dark:text-white font-medium">{circular.targetAudience}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500 dark:text-gray-400">Valid Until:</span>
                <span className="text-gray-900 dark:text-white font-medium">{circular.validUntil}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                className="flex items-center gap-1 flex-1"
                onClick={() => handleViewCircular(circular)}
              >
                <EyeIcon className="w-4 h-4" />
                View
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1 flex-1">
                <DownloadIcon className="w-4 h-4" />
                Download
              </Button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Published: {circular.publishedDate}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {circular.attachments} attachment{circular.attachments !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-xl">
              <TagIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">High Priority</h3>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {circulars.filter(c => c.priority === 'High').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
              <DocumentTextIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Documents</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {circulars.reduce((acc, curr) => acc + curr.attachments, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
              <UserGroupIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Departments</h3>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {new Set(circulars.map(c => c.publishedBy)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* View Circular Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Circular Details"
      >
        {selectedCircular && (
          <div className="space-y-6">
            {/* Header Section */}
            <div>
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedCircular.title}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedCircular.priority)}`}>
                  {selectedCircular.priority}
                </span>
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {selectedCircular.description}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TagIcon className="w-4 h-4 text-gray-400" />
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</h4>
                  </div>
                  <p className="text-gray-900 dark:text-white">{selectedCircular.category}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <UserGroupIcon className="w-4 h-4 text-gray-400" />
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Target Audience</h4>
                  </div>
                  <p className="text-gray-900 dark:text-white">{selectedCircular.targetAudience}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Published By</h4>
                  </div>
                  <p className="text-gray-900 dark:text-white">{selectedCircular.publishedBy}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Published Date</h4>
                  </div>
                  <p className="text-gray-900 dark:text-white">{selectedCircular.publishedDate}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Valid Until</h4>
                  </div>
                  <p className="text-gray-900 dark:text-white">{selectedCircular.validUntil}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <DocumentTextIcon className="w-4 h-4 text-gray-400" />
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Attachments</h4>
                  </div>
                  <p className="text-gray-900 dark:text-white">{selectedCircular.attachments} file(s)</p>
                </div>
              </div>
            </div>

            {/* Important Note */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100">Important Note</h5>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Please ensure to review all attachments and follow the guidelines mentioned in this circular.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                className="flex items-center gap-2"
              >
                <DownloadIcon className="w-4 h-4" />
                Download Attachments
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OfficeCircular;
