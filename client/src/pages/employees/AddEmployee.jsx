import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  DollarSign,
  Upload,
  ArrowLeft,
  Save,
  Lock,
  Eye,
  EyeOff,
  Hash
} from 'lucide-react';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import employeeStore from '../../utils/employeeStore';
import toast from 'react-hot-toast';

const AddEmployee = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loadingEmployeeId, setLoadingEmployeeId] = useState(false);

  // Validation schema
  const validationSchema = Yup.object({
    firstName: Yup.string()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must be less than 50 characters')
      .required('First name is required'),
    lastName: Yup.string()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must be less than 50 characters')
      .required('Last name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    phone: Yup.string()
      .matches(/^[0-9+\-\s()]+$/, 'Invalid phone number')
      .min(10, 'Phone number must be at least 10 digits')
      .required('Phone number is required'),
    address: Yup.string()
      .min(10, 'Address must be at least 10 characters')
      .required('Address is required'),
    dateOfBirth: Yup.date()
      .max(new Date(), 'Date of birth cannot be in the future')
      .required('Date of birth is required'),
    joiningDate: Yup.date()
      .required('Joining date is required'),
    department: Yup.string()
      .required('Department is required'),
    designation: Yup.string()
      .required('Designation is required'),
    salary: Yup.number()
      .positive('Salary must be a positive number')
      .required('Salary is required'),
    employeeId: Yup.string()
      .min(3, 'Employee ID must be at least 3 characters')
      .required('Employee ID is required'),
    role: Yup.string()
      .oneOf(['employee', 'hr_manager', 'admin'], 'Invalid role')
      .required('Role is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .max(50, 'Password must be less than 50 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Please confirm the password')
  });

  // Form handling
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      joiningDate: '',
      department: '',
      designation: '',
      salary: '',
      employeeId: '',
      role: 'employee',
      emergencyContact: '',
      emergencyPhone: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Prepare employee data
        const employeeData = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          department: values.department,
          designation: values.designation,
          employmentType: 'full_time',
          salary: parseFloat(values.salary),
          dateOfJoining: values.joiningDate,
          dateOfBirth: values.dateOfBirth,
          address: {
            street: values.address,
            city: '',
            state: '',
            zipCode: '',
            country: ''
          },
          emergencyContact: {
            name: values.emergencyContact,
            relationship: '',
            phone: values.emergencyPhone
          },
          status: 'active',
          profileImage: imagePreview,
          employeeId: values.employeeId,
          role: values.role,
          password: values.password
        };
        
        // Add employee to database
        const newEmployee = await employeeStore.addEmployee(employeeData);
        
        toast.success(`${newEmployee.firstName} ${newEmployee.lastName} has been added successfully!`);
        navigate('/employees');
      } catch (error) {
        console.error('Error adding employee:', error);
        const errorMessage = error.response?.data?.message || 'Failed to add employee. Please try again.';
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  });

  // Function to fetch next available Employee ID
  const fetchNextEmployeeId = async (role) => {
    try {
      setLoadingEmployeeId(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5001/api/employees/next-id/${role}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.employeeCode) {
        formik.setFieldValue('employeeId', response.data.employeeCode);
      }
    } catch (error) {
      console.error('Error fetching employee ID:', error);
      toast.error('Failed to generate Employee ID. Please try again.');
    } finally {
      setLoadingEmployeeId(false);
    }
  };

  // Fetch Employee ID when role changes
  useEffect(() => {
    if (formik.values.role) {
      fetchNextEmployeeId(formik.values.role);
    }
  }, [formik.values.role]);

  // Fetch initial Employee ID on component mount
  useEffect(() => {
    fetchNextEmployeeId('employee'); // Default role
  }, []);

  // Handle image upload
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const departments = [
    'Human Resources',
    'Engineering',
    'Marketing',
    'Sales',
    'Finance',
    'Operations',
    'Customer Support',
    'Legal',
    'IT',
    'Administration'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/employees')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Employees</span>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Add New Employee
          </h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Image Upload */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Profile Picture
              </h3>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-gray-400" />
                  )}
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>Upload Photo</span>
                  </div>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  JPG, PNG or GIF (max. 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      {...formik.getFieldProps('firstName')}
                      className={`pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 ${
                        formik.touched.firstName && formik.errors.firstName
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter first name"
                    />
                  </div>
                  {formik.touched.firstName && formik.errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      {...formik.getFieldProps('lastName')}
                      className={`pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 ${
                        formik.touched.lastName && formik.errors.lastName
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter last name"
                    />
                  </div>
                  {formik.touched.lastName && formik.errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      {...formik.getFieldProps('email')}
                      className={`pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 ${
                        formik.touched.email && formik.errors.email
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter email address"
                    />
                  </div>
                  {formik.touched.email && formik.errors.email && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      {...formik.getFieldProps('phone')}
                      className={`pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 ${
                        formik.touched.phone && formik.errors.phone
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter phone number"
                    />
                  </div>
                  {formik.touched.phone && formik.errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.phone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <textarea
                      {...formik.getFieldProps('address')}
                      rows={3}
                      className={`pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 ${
                        formik.touched.address && formik.errors.address
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter full address"
                    />
                  </div>
                  {formik.touched.address && formik.errors.address && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date of Birth *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      {...formik.getFieldProps('dateOfBirth')}
                      className={`pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 ${
                        formik.touched.dateOfBirth && formik.errors.dateOfBirth
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.dateOfBirth}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps('emergencyContact')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                    placeholder="Emergency contact name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Emergency Phone
                  </label>
                  <input
                    type="tel"
                    {...formik.getFieldProps('emergencyPhone')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                    placeholder="Emergency contact phone"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Login Credentials */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Login Credentials
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  {...formik.getFieldProps('password')}
                  className={`pl-10 pr-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 ${
                    formik.touched.password && formik.errors.password
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter password for employee login"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                This password will be used by the employee to login to the system
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...formik.getFieldProps('confirmPassword')}
                  className={`pl-10 pr-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 ${
                    formik.touched.confirmPassword && formik.errors.confirmPassword
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="Confirm the password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.confirmPassword}</p>
              )}
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Password Requirements
                </h4>
                <ul className="mt-1 text-sm text-blue-700 dark:text-blue-300 list-disc list-inside">
                  <li>Minimum 6 characters long</li>
                  <li>Employee will use this password to login directly</li>
                  <li>Employee can change password anytime from profile settings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Employment Information */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Employment Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Employee ID *
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={formik.values.employeeId}
                  readOnly
                  className={`pl-10 pr-10 w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed ${
                    formik.touched.employeeId && formik.errors.employeeId
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Auto-generated based on role"
                />
                {loadingEmployeeId && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <LoadingSpinner size="small" />
                  </div>
                )}
              </div>
              {formik.touched.employeeId && formik.errors.employeeId && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.employeeId}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Employee ID is automatically generated based on the selected role
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Department *
              </label>
              <select
                {...formik.getFieldProps('department')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 ${
                  formik.touched.department && formik.errors.department
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {formik.touched.department && formik.errors.department && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.department}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Designation *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  {...formik.getFieldProps('designation')}
                  className={`pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 ${
                    formik.touched.designation && formik.errors.designation
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="e.g., Software Engineer"
                />
              </div>
              {formik.touched.designation && formik.errors.designation && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.designation}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Joining Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  {...formik.getFieldProps('joiningDate')}
                  className={`pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 ${
                    formik.touched.joiningDate && formik.errors.joiningDate
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                />
              </div>
              {formik.touched.joiningDate && formik.errors.joiningDate && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.joiningDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Salary *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  {...formik.getFieldProps('salary')}
                  className={`pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 ${
                    formik.touched.salary && formik.errors.salary
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter salary amount"
                />
              </div>
              {formik.touched.salary && formik.errors.salary && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.salary}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role *
              </label>
              <select
                {...formik.getFieldProps('role')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 ${
                  formik.touched.role && formik.errors.role
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              >
                <option value="employee">Employee</option>
                <option value="hr_manager">HR Manager</option>
                <option value="admin">Admin</option>
              </select>
              {formik.touched.role && formik.errors.role && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.role}</p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/employees')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2"
          >
            {loading ? (
              <LoadingSpinner size="small" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{loading ? 'Adding Employee...' : 'Add Employee'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;
