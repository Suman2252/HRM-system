import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  ArrowLeft, 
  Save, 
  Crown, 
  Settings, 
  Mail, 
  Phone, 
  Calendar,
  Users,
  Briefcase,
  GraduationCap,
  Heart,
  FileText,
  Plus,
  Minus,
  X,
  Building,
  MapPin,
  Award,
  BookOpen
} from 'lucide-react';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminEditProfile = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  // Form state for all sections
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    age: '',
    emailOffice: '',
    phoneAlt: '',
    pan: '',
    aadhar: '',
    marital: '',
    bloodGroup: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    
    // Family Information
    familyInfo: {
      fatherName: '',
      fatherAge: '',
      motherName: '',
      motherAge: '',
      spouseName: '',
      drivingLicense: '',
      passport: '',
      other: ''
    },

    // Dependents (dynamic tabs)
    dependents: [
      {
        id: 1,
        name: '',
        relationship: '',
        age: '',
        occupation: '',
        phone: ''
      }
    ],

    // Job Experience (dynamic)
    jobExperience: [
      {
        id: 1,
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: '',
        salary: ''
      }
    ],

    // Education (dynamic rows)
    education: [
      {
        id: 1,
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startYear: '',
        endYear: '',
        cgpa: '',
        sgpa: '',
        percentage: ''
      }
    ]
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.personalInfo?.gender || '',
        dateOfBirth: user.dateOfBirth || '',
        age: user.personalInfo?.age || '',
        emailOffice: user.personalInfo?.emailOffice || '',
        phoneAlt: user.personalInfo?.phoneAlt || '',
        pan: user.personalInfo?.pan || '',
        aadhar: user.personalInfo?.aadhar || '',
        marital: user.personalInfo?.marital || '',
        bloodGroup: user.bloodGroup || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          country: user.address?.country || '',
          zipCode: user.address?.zipCode || ''
        },
        familyInfo: {
          fatherName: user.familyInfo?.fatherName || '',
          fatherAge: user.familyInfo?.fatherAge || '',
          motherName: user.familyInfo?.motherName || '',
          motherAge: user.familyInfo?.motherAge || '',
          spouseName: user.familyInfo?.spouseName || '',
          drivingLicense: user.familyInfo?.drivingLicense || '',
          passport: user.familyInfo?.passport || '',
          other: user.familyInfo?.other || ''
        },
        dependents: user.dependents || [{ id: 1, name: '', relationship: '', age: '', occupation: '', phone: '' }],
        jobExperience: user.jobExperience || [{ id: 1, company: '', position: '', startDate: '', endDate: '', description: '', salary: '' }],
        education: user.education || [{ id: 1, institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '', cgpa: '', sgpa: '', percentage: '' }]
      });
    }
  }, [user]);

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'family', label: 'Family Info', icon: Users },
    { id: 'dependents', label: 'Dependents', icon: Heart },
    { id: 'job', label: 'Job Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap }
  ];

  const handleInputChange = (section, field, value, index = null, subField = null) => {
    setFormData(prev => {
      if (section === 'address') {
        return {
          ...prev,
          address: {
            ...prev.address,
            [field]: value
          }
        };
      } else if (section === 'familyInfo') {
        return {
          ...prev,
          familyInfo: {
            ...prev.familyInfo,
            [field]: value
          }
        };
      } else if (section === 'dependents' || section === 'jobExperience' || section === 'education') {
        const newArray = [...prev[section]];
        if (subField) {
          newArray[index] = {
            ...newArray[index],
            [subField]: value
          };
        } else {
          newArray[index] = {
            ...newArray[index],
            [field]: value
          };
        }
        return {
          ...prev,
          [section]: newArray
        };
      } else {
        return {
          ...prev,
          [field]: value
        };
      }
    });
  };

  const addDynamicItem = (section) => {
    setFormData(prev => {
      const newId = Math.max(...prev[section].map(item => item.id)) + 1;
      let newItem = { id: newId };
      
      if (section === 'dependents') {
        newItem = { ...newItem, name: '', relationship: '', age: '', occupation: '', phone: '' };
      } else if (section === 'jobExperience') {
        newItem = { ...newItem, company: '', position: '', startDate: '', endDate: '', description: '', salary: '' };
      } else if (section === 'education') {
        newItem = { ...newItem, institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '', cgpa: '', sgpa: '', percentage: '' };
      }
      
      return {
        ...prev,
        [section]: [...prev[section], newItem]
      };
    });
  };

  const removeDynamicItem = (section, id) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter(item => item.id !== id)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        toast.success('Profile updated successfully!');
        navigate('/profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <User className="w-4 h-4 text-indigo-500" />
            <span>First Name</span>
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('', 'firstName', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200"
            placeholder="Enter first name"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <User className="w-4 h-4 text-indigo-500" />
            <span>Last Name</span>
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('', 'lastName', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200"
            placeholder="Enter last name"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <Mail className="w-4 h-4 text-indigo-500" />
            <span>Email</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('', 'email', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200"
            placeholder="Enter email"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <Phone className="w-4 h-4 text-indigo-500" />
            <span>Phone</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('', 'phone', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200"
            placeholder="Enter phone number"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <User className="w-4 h-4 text-indigo-500" />
            <span>Gender</span>
          </label>
          <select
            value={formData.gender}
            onChange={(e) => handleInputChange('', 'gender', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>Date of Birth</span>
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('', 'dateOfBirth', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <Mail className="w-4 h-4 text-indigo-500" />
            <span>Office Email</span>
          </label>
          <input
            type="email"
            value={formData.emailOffice}
            onChange={(e) => handleInputChange('', 'emailOffice', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200"
            placeholder="Enter office email"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <Phone className="w-4 h-4 text-indigo-500" />
            <span>Alternate Phone</span>
          </label>
          <input
            type="tel"
            value={formData.phoneAlt}
            onChange={(e) => handleInputChange('', 'phoneAlt', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200"
            placeholder="Enter alternate phone"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <FileText className="w-4 h-4 text-indigo-500" />
            <span>PAN Number</span>
          </label>
          <input
            type="text"
            value={formData.pan}
            onChange={(e) => handleInputChange('', 'pan', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200"
            placeholder="Enter PAN number"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <FileText className="w-4 h-4 text-indigo-500" />
            <span>Aadhar Number</span>
          </label>
          <input
            type="text"
            value={formData.aadhar}
            onChange={(e) => handleInputChange('', 'aadhar', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200"
            placeholder="Enter Aadhar number"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <Heart className="w-4 h-4 text-indigo-500" />
            <span>Marital Status</span>
          </label>
          <select
            value={formData.marital}
            onChange={(e) => handleInputChange('', 'marital', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200"
          >
            <option value="">Select Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <Heart className="w-4 h-4 text-indigo-500" />
            <span>Blood Group</span>
          </label>
          <select
            value={formData.bloodGroup}
            onChange={(e) => handleInputChange('', 'bloodGroup', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200"
          >
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
      </div>

      {/* Address Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-indigo-500" />
          <span>Address Information</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Street</label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) => handleInputChange('address', 'street', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200"
              placeholder="Enter street address"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
            <input
              type="text"
              value={formData.address.city}
              onChange={(e) => handleInputChange('address', 'city', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200"
              placeholder="Enter city"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
            <input
              type="text"
              value={formData.address.state}
              onChange={(e) => handleInputChange('address', 'state', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200"
              placeholder="Enter state"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
            <input
              type="text"
              value={formData.address.country}
              onChange={(e) => handleInputChange('address', 'country', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200"
              placeholder="Enter country"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ZIP Code</label>
            <input
              type="text"
              value={formData.address.zipCode}
              onChange={(e) => handleInputChange('address', 'zipCode', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200"
              placeholder="Enter ZIP code"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderFamilyInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <User className="w-4 h-4 text-indigo-500" />
            <span>Father's Name</span>
          </label>
          <input
            type="text"
            value={formData.familyInfo.fatherName}
            onChange={(e) => handleInputChange('familyInfo', 'fatherName', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200"
            placeholder="Enter father's name"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>Father's Age</span>
          </label>
          <input
            type="number"
            value={formData.familyInfo.fatherAge}
            onChange={(e) => handleInputChange('familyInfo', 'fatherAge', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200"
            placeholder="Enter father's age"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <User className="w-4 h-4 text-indigo-500" />
            <span>Mother's Name</span>
          </label>
          <input
            type="text"
            value={formData.familyInfo.motherName}
            onChange={(e) => handleInputChange('familyInfo', 'motherName', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200"
            placeholder="Enter mother's name"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>Mother's Age</span>
          </label>
          <input
            type="number"
            value={formData.familyInfo.motherAge}
            onChange={(e) => handleInputChange('familyInfo', 'motherAge', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200"
            placeholder="Enter mother's age"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <Heart className="w-4 h-4 text-indigo-500" />
            <span>Spouse Name</span>
          </label>
          <input
            type="text"
            value={formData.familyInfo.spouseName}
            onChange={(e) => handleInputChange('familyInfo', 'spouseName', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200"
            placeholder="Enter spouse name"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <FileText className="w-4 h-4 text-indigo-500" />
            <span>Driving License</span>
          </label>
          <input
            type="text"
            value={formData.familyInfo.drivingLicense}
            onChange={(e) => handleInputChange('familyInfo', 'drivingLicense', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200"
            placeholder="Enter driving license number"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <FileText className="w-4 h-4 text-indigo-500" />
            <span>Passport</span>
          </label>
          <input
            type="text"
            value={formData.familyInfo.passport}
            onChange={(e) => handleInputChange('familyInfo', 'passport', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200"
            placeholder="Enter passport number"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <FileText className="w-4 h-4 text-indigo-500" />
            <span>Other Information</span>
          </label>
          <textarea
            value={formData.familyInfo.other}
            onChange={(e) => handleInputChange('familyInfo', 'other', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200"
            placeholder="
