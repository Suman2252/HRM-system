import { useState } from 'react';
import { 
  ExclamationTriangleIcon, 
  EyeIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  TagIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const Complaints = () => {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedComplaintForComment, setSelectedComplaintForComment] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [complaints, setComplaints] = useState([
    {
      id: 1,
      title: 'Air Conditioning Issue',
      description: 'The AC in the main office is not working properly. Temperature is too high.',
      category: 'Facilities',
      priority: 'High',
      status: 'Open',
      submittedBy: 'John Doe',
      submittedDate: '2024-01-18',
      assignedTo: 'Facilities Team',
      department: 'Operations',
      updates: [
        {
          date: '2024-01-18',
          comment: 'Complaint received and logged in the system',
          by: 'System'
        },
        {
          date: '2024-01-18',
          comment: 'Assigned to Facilities Team for investigation',
          by: 'HR Manager'
        }
      ]
    },
    {
      id: 2,
      title: 'Parking Space Shortage',
      description: 'Not enough parking spaces for all employees. Need additional parking area.',
      category: 'Infrastructure',
      priority: 'Medium',
      status: 'In Progress',
      submittedBy: 'Jane Smith',
      submittedDate: '2024-01-15',
      assignedTo: 'Admin Team',
      department: 'HR',
      updates: [
        {
          date: '2024-01-15',
          comment: 'Request received for additional parking spaces',
          by: 'System'
        },
        {
          date: '2024-01-16',
          comment: 'Site survey scheduled for next week',
          by: 'Admin Team'
        }
      ]
    },
    {
      id: 3,
      title: 'Internet Connectivity',
      description: 'Slow internet connection affecting productivity in the development team.',
      category: 'IT',
      priority: 'High',
      status: 'Resolved',
      submittedBy: 'Mike Johnson',
      submittedDate: '2024-01-10',
      assignedTo: 'IT Support',
      department: 'Development',
      updates: [
        {
          date: '2024-01-10',
          comment: 'Internet connectivity issue reported',
          by: 'System'
        },
        {
          date: '2024-01-11',
          comment: 'Network diagnostics completed, upgrading bandwidth',
          by: 'IT Support'
        },
        {
          date: '2024-01-12',
          comment: 'Issue resolved, bandwidth upgraded successfully',
          by: 'IT Support'
        }
      ]
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

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

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setIsModalOpen(true);
  };

  const handleOpenCommentModal = (complaint) => {
    setSelectedComplaintForComment(complaint);
    setIsCommentModalOpen(true);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const updatedComplaints = complaints.map(complaint => {
      if (complaint.id === selectedComplaintForComment.id) {
        return {
          ...complaint,
          updates: [
            ...complaint.updates,
            {
              date: new Date().toISOString().split('T')[0],
              comment: newComment,
              by: 'Employee' // This should come from auth context in a real app
            }
          ]
        };
      }
      return complaint;
    });

    setComplaints(updatedComplaints);
    setNewComment('');
    setIsCommentModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 rounded-2xl p-6 md:p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Complaints Management</h1>
              <p className="text-red-100 text-lg">Submit and track workplace complaints</p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <ExclamationTriangleIcon className="w-8 h-8 mb-2" />
                <div className="text-sm text-red-100">Total Complaints</div>
                <div className="text-xl font-bold">{complaints.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complaints Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {complaints.map((complaint) => (
          <div key={complaint.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-xl">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{complaint.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">#{complaint.id}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(complaint.status)}`}>
                  {complaint.status}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(complaint.priority)}`}>
                  {complaint.priority}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
              {complaint.description}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Category:</span>
                <span className="text-gray-900 dark:text-white font-medium">{complaint.category}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Submitted by:</span>
                <span className="text-gray-900 dark:text-white font-medium">{complaint.submittedBy}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Date:</span>
                <span className="text-gray-900 dark:text-white font-medium">{complaint.submittedDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Assigned to:</span>
                <span className="text-gray-900 dark:text-white font-medium">{complaint.assignedTo}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                className="flex items-center gap-1 flex-1"
                onClick={() => handleViewComplaint(complaint)}
              >
                <EyeIcon className="w-4 h-4" />
                View
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 flex-1"
                onClick={() => handleOpenCommentModal(complaint)}
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                Comment
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-xl">
              <ClockIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Open Complaints</h3>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {complaints.filter(c => c.status === 'Open').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-xl">
              <ClockIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">In Progress</h3>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {complaints.filter(c => c.status === 'In Progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
              <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resolved</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {complaints.filter(c => c.status === 'Resolved').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Complaint Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Complaint Details"
      >
        {selectedComplaint && (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-start">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedComplaint.title}
                </h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedComplaint.priority)}`}>
                  {selectedComplaint.priority}
                </span>
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {selectedComplaint.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</h5>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedComplaint.category}</p>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h5>
                <p className={`mt-1 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedComplaint.status)}`}>
                  {selectedComplaint.status}
                </p>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted By</h5>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedComplaint.submittedBy}</p>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</h5>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedComplaint.department}</p>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned To</h5>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedComplaint.assignedTo}</p>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted On</h5>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedComplaint.submittedDate}</p>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Updates</h5>
              <div className="space-y-4">
                {selectedComplaint.updates.map((update, index) => (
                  <div 
                    key={index}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-sm text-gray-900 dark:text-white">{update.comment}</p>
                    </div>
                    <div className="mt-2 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                      <span>{update.by}</span>
                      <span>{update.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Comment Modal */}
      <Modal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        title="Add Comment"
      >
        {selectedComplaintForComment && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {selectedComplaintForComment.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add your comment or update regarding this complaint. This will be sent to the admin for review.
              </p>
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Comment
              </label>
              <textarea
                id="comment"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                placeholder="Enter your comment here..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100">Note</h5>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Your comment will be added to the complaint history and the admin will be notified.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setIsCommentModalOpen(false);
                  setNewComment('');
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="flex items-center gap-2"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                Send Comment
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Complaints;
