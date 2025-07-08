import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  ArrowLeft, 
  Save, 
  Crown, 
  Shield, 
  Settings, 
  Mail, 
  Phone, 
  UserCheck,
  Sparkles,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  GraduationCap,
  Heart,
  FileText,
  Star,
  ChevronUp
} from 'lucide-react';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminProfile = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isPersonalInfoExpanded, setIsPersonalInfoExpanded] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  // Use real user data from AuthContext
  const adminData = {
    name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Admin',
    employeeId: user?.employeeCode || 'ADMIN001',
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
      emailOffice: user?.personalInfo?.emailOffice || user?.email || 'N/A',
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
    { id: 'epf', label: 'E.P.F & E.S.I', icon: FileText },
    { id: 'edit', label: 'Edit Profile', icon: Settings }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        toast.success('Profile updated successfully!');
        setActiveTab('overview');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Personal Information Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg">
              <div 
                className="flex items-center justify-between p-6 cursor-pointer"
                onClick={() => setIsPersonalInfoExpanded(!isPersonalInfoExpanded)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Personal Information</h3>
                </div>
                <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${isPersonalInfoExpanded ? 'rotate-180' : ''}`} />
              </div>
              
              {isPersonalInfoExpanded && (
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                        <User className="w-5 h-5 text-indigo-600" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Gender</span>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{adminData.personalInfo.gender}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                        <Calendar className="w-5 h-5 text-green-600" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Date of Birth</span>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{adminData.personalInfo.dob}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Age</span>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{adminData.personalInfo.age}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl">
                        <Mail className="w-5 h-5 text-orange-600" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Email (Office)</span>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{adminData.personalInfo.emailOffice}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl">
                        <Phone className="w-5 h-5 text-teal-600" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone (Alt)</span>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{adminData.personalInfo.phoneAlt}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-xl">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">PAN</span>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{adminData.personalInfo.pan}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl">
                        <FileText className="w-5 h-5 text-yellow-600" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Aadhar</span>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{adminData.personalInfo.aadhar}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl">
                        <Heart className="w-5 h-5 text-rose-600" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Marital Status</span>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{adminData.personalInfo.marital}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Family Information */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                        <User className="w-5 h-5 text-indigo-600" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Father Name</span>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{adminData.familyInfo.fatherName}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                        <Calendar className="w-5 h-5 text-green-600" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Father's Age</span>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{adminData.familyInfo.fatherAge}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                        <User className="w-5 h-5 text-purple-600" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Mother Name</span>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{adminData.familyInfo.motherName}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl">
                        <Calendar className="w-5 h-5 text-orange-600" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Mother's Age</span>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{adminData.familyInfo.motherAge}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl">
                        <User className="w-5 h-5 text-teal-600" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Spouse Name</span>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{adminData.familyInfo.spouseName || '-'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-xl">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Driving License</span>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{adminData.familyInfo.drivingLicense}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl">
                        <FileText className="w-5 h-5 text-yellow-600" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Passport</span>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{adminData.familyInfo.passport}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl">
                        <FileText className="w-5 h-5 text-rose-600" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Other</span>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{adminData.familyInfo.other}</p>
                        </div>
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Contact Information</h3>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{adminData.phone}</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{adminData.email}</p>
                </div>
                <div className="md:col-span-2 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{adminData.address}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'edit':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Edit Administrator Profile
                  </h3>
                  <p className="text-indigo-100">
                    Update your administrative profile details with comprehensive information
                  </p>
                </div>
              </div>
            </div>

            {/* Notice about comprehensive editing */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 m-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Settings className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Comprehensive Profile Editing:</strong> This page includes all the fields from your admin profile overview section. 
                    You can edit personal information, family details, dependents, job experience, and education with dynamic tabs and rows as requested.
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                    Features include: Dynamic tabs for dependents and job experience, education rows with CGPA/SGPA fields, 
                    and the ability to add/remove sections as needed.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* First Name */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <User className="w-4 h-4 text-indigo-500" />
                    <span>First Name</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200 hover:border-indigo-300"
                      placeholder="Enter your first name"
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <User className="w-4 h-4 text-indigo-500" />
                    <span>Last Name</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200 hover:border-indigo-300"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Mail className="w-4 h-4 text-indigo-500" />
                    <span>Email Address</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200 hover:border-indigo-300"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Phone className="w-4 h-4 text-indigo-500" />
                    <span>Phone Number</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200 hover:border-indigo-300"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('overview')}
                  className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  {saving ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        );
      
      default:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
                {tabs.find(tab => tab.id === activeTab)?.icon && 
                  React.createElement(tabs.find(tab => tab.id === activeTab).icon, { className: "w-5 h-5 text-white" })
                }
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </h3>
            </div>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Content for {activeTab} tab will be implemented here.</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">This section is under development.</p>
            </div>
          </div>
        );
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Premium Header */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-purple-600/90"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-20 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-20 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
        </div>

        <div className="relative px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    Hello Admin Profile
                  </h1>
                  <p className="text-indigo-100 text-lg">
                    Welcome to your administrator profile dashboard
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Shield className="w-4 h-4 text-yellow-300" />
                    <span className="text-sm text-yellow-200 font-medium">Administrator Access</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Dashboard</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Sidebar - Admin Info */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-4">
                  {adminData.name}
                </h3>
                <p className="text-indigo-600 dark:text-indigo-400 font-medium">System Administrator</p>
              </div>

              {/* Admin Stats */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Account Status</p>
                      <p className="font-semibold text-green-600">Active & Verified</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Permissions</p>
                      <p className="font-semibold text-purple-600">Full Access</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Security Level</p>
                      <p className="font-semibold text-green-600">Maximum</p>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Basic Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Admin ID</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{adminData.employeeId}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Heart className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Blood Group</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{adminData.bloodGroup}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Phone</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{adminData.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Email</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white break-all">{adminData.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Address</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{adminData.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Tabs */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 mb-6 shadow-lg">
              <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
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
    </div>
  );
};

export default AdminProfile;
