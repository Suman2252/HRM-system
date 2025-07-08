import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Users, 
  Briefcase, 
  GraduationCap, 
  Heart, 
  FileText,
  Edit3,
  Star,
  ChevronUp
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isPersonalInfoExpanded, setIsPersonalInfoExpanded] = useState(true);

  // Use real user data from AuthContext
  const employeeData = {
    name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User',
    employeeId: user?.employeeCode || 'N/A',
    bloodGroup: user?.bloodGroup || 'N/A',
    phone: user?.phone || 'N/A',
    email: user?.email || 'N/A',
    address: user?.address ? 
      `${user.address.street || ''}, ${user.address.city || ''}, ${user.address.state || ''}, ${user.address.country || ''} ${user.address.zipCode || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '') || 'N/A'
      : 'N/A',
    profileImage: user?.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    personalInfo: {
      gender: user?.personalInfo?.gender || 'N/A',
      dob: user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-GB') : 'N/A',
      age: user?.personalInfo?.age || 'N/A',
      emailOffice: user?.personalInfo?.emailOffice || 'N/A',
      phoneAlt: user?.personalInfo?.phoneAlt || 'N/A',
      pan: user?.personalInfo?.pan || 'N/A',
      aadhar: user?.personalInfo?.aadhar || 'N/A',
      marital: user?.personalInfo?.marital || 'N/A'
    },
    familyInfo: {
      fatherName: user?.familyInfo?.fatherName || 'N/A',
      fatherAge: user?.familyInfo?.fatherAge || 'N/A',
      motherName: user?.familyInfo?.motherName || 'N/A',
      motherAge: user?.familyInfo?.motherAge || 'N/A',
      spouseName: user?.familyInfo?.spouseName || 'N/A',
      drivingLicense: user?.familyInfo?.drivingLicense || 'N/A',
      passport: user?.familyInfo?.passport || 'N/A',
      other: user?.familyInfo?.other || 'N/A'
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Star },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'job', label: 'Job', icon: Briefcase },
    { id: 'dependants', label: 'Dependants', icon: Users },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'epf', label: 'E.P.F & E.S.I', icon: FileText }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Personal Information Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => setIsPersonalInfoExpanded(!isPersonalInfoExpanded)}
              >
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                </div>
                <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${isPersonalInfoExpanded ? 'rotate-180' : ''}`} />
              </div>
              
              {isPersonalInfoExpanded && (
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-24">Gender</span>
                        <span className="text-sm text-gray-900 dark:text-white">{employeeData.personalInfo.gender}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-24">DOB</span>
                        <span className="text-sm text-gray-900 dark:text-white">{employeeData.personalInfo.dob}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-24">Age</span>
                        <span className="text-sm text-gray-900 dark:text-white">{employeeData.personalInfo.age}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-24">Email (Office)</span>
                        <span className="text-sm text-gray-900 dark:text-white">{employeeData.personalInfo.emailOffice}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-24">Phone(Alt)</span>
                        <span className="text-sm text-gray-900 dark:text-white">{employeeData.personalInfo.phoneAlt}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-24">PAN</span>
                        <span className="text-sm text-gray-900 dark:text-white">{employeeData.personalInfo.pan}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-24">Aadhar</span>
                        <span className="text-sm text-gray-900 dark:text-white">{employeeData.personalInfo.aadhar}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Heart className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-24">Marital</span>
                        <span className="text-sm text-gray-900 dark:text-white">{employeeData.personalInfo.marital}</span>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-32">Father Name</span>
                        <span className="text-sm text-gray-900 dark:text-white">{employeeData.familyInfo.fatherName}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-32">Father's Age</span>
                        <span className="text-sm text-gray-900 dark:text-white">{employeeData.familyInfo.fatherAge}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-32">Mother Name</span>
                        <span className="text-sm text-gray-900 dark:text-white">{employeeData.familyInfo.motherName}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-32">Mother's Age</span>
                        <span className="text-sm text-gray-900 dark:text-white">{employeeData.familyInfo.motherAge}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-32">Spouse name</span>
                        <span className="text-sm text-gray-900 dark:text-white">{employeeData.familyInfo.spouseName || '-'}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-32">Driving License</span>
                        <span className="text-sm text-gray-900 dark:text-white">{employeeData.familyInfo.drivingLicense}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-32">Passport</span>
                        <span className="text-sm text-gray-900 dark:text-white">{employeeData.familyInfo.passport}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-32">Other</span>
                        <span className="text-sm text-gray-900 dark:text-white">{employeeData.familyInfo.other}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'contact':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                  <p className="text-sm text-gray-900 dark:text-white">{employeeData.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <p className="text-sm text-gray-900 dark:text-white">{employeeData.email}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                  <p className="text-sm text-gray-900 dark:text-white">{employeeData.address}</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Content for {activeTab} tab will be implemented here.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Profile</span>
              <span>/</span>
              <span className="text-gray-900 dark:text-white">
                {user?.role === 'admin' ? 'Admin Profile' : 
                 user?.role === 'hr' || user?.role === 'hr_manager' ? 'HR Profile' : 
                 'Employee Profile'}
              </span>
            </nav>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              Hello {user?.role === 'admin' ? 'Admin' : 
                     user?.role === 'hr' || user?.role === 'hr_manager' ? 'HR' : 
                     'Employee'} Profile
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Welcome to your {user?.role === 'admin' ? 'administrator' : 
                              user?.role === 'hr' || user?.role === 'hr_manager' ? 'HR manager' : 
                              'employee'} profile dashboard
            </p>
          </div>
          <Link 
            to={user?.role === 'admin' || user?.role === 'hr_manager' ? "/profile/edit" : `/profile/edit`}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar - Employee Info */}
        <div className="w-80 bg-gradient-to-br from-orange-400 to-red-500 p-6">
          <div className="text-center text-white">
            <div className="relative inline-block mb-4">
              <img
                src={employeeData.profileImage}
                alt={employeeData.name}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              />
            </div>
            <h2 className="text-xl font-bold mb-6">{employeeData.name}</h2>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-gray-900 mb-4">Basic Information</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FileText className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-sm text-gray-600">Employee ID</span>
                  <p className="text-sm font-medium text-gray-900">{employeeData.employeeId}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Heart className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-sm text-gray-600">Blood Group</span>
                  <p className="text-sm font-medium text-gray-900">{employeeData.bloodGroup}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-sm text-gray-600">Phone</span>
                  <p className="text-sm font-medium text-gray-900">{employeeData.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-sm text-gray-600">Email</span>
                  <p className="text-sm font-medium text-gray-900 break-all">{employeeData.email}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <span className="text-sm text-gray-600">Address</span>
                  <p className="text-sm font-medium text-gray-900">{employeeData.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Profile;
