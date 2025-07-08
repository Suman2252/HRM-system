import * as Yup from 'yup';
import { DEPARTMENTS, DESIGNATIONS, EMPLOYMENT_TYPES } from './constants';

// Auth Schemas
export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

export const registerSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

// Employee Schemas
export const employeeSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^\+?[\d\s-]+$/, 'Invalid phone number')
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must not exceed 15 digits')
    .required('Phone number is required'),
  department: Yup.string()
    .oneOf(DEPARTMENTS, 'Invalid department')
    .required('Department is required'),
  designation: Yup.string()
    .oneOf(DESIGNATIONS, 'Invalid designation')
    .required('Designation is required'),
  employmentType: Yup.string()
    .oneOf(Object.values(EMPLOYMENT_TYPES), 'Invalid employment type')
    .required('Employment type is required'),
  joiningDate: Yup.date()
    .max(new Date(), 'Joining date cannot be in the future')
    .required('Joining date is required'),
  salary: Yup.number()
    .positive('Salary must be positive')
    .required('Salary is required'),
});

// Leave Schemas
export const leaveApplicationSchema = Yup.object().shape({
  leaveType: Yup.string()
    .required('Leave type is required'),
  startDate: Yup.date()
    .min(new Date(), 'Start date cannot be in the past')
    .required('Start date is required'),
  endDate: Yup.date()
    .min(Yup.ref('startDate'), 'End date cannot be before start date')
    .required('End date is required'),
  reason: Yup.string()
    .min(10, 'Reason must be at least 10 characters')
    .required('Reason is required'),
});

// Attendance Schemas
export const attendanceSchema = Yup.object().shape({
  date: Yup.date()
    .max(new Date(), 'Date cannot be in the future')
    .required('Date is required'),
  status: Yup.string()
    .required('Status is required'),
  notes: Yup.string()
    .min(5, 'Notes must be at least 5 characters'),
});

// Payroll Schemas
export const payrollSchema = Yup.object().shape({
  month: Yup.date()
    .required('Month is required'),
  basicSalary: Yup.number()
    .positive('Basic salary must be positive')
    .required('Basic salary is required'),
  allowances: Yup.number()
    .min(0, 'Allowances cannot be negative')
    .required('Allowances is required'),
  deductions: Yup.number()
    .min(0, 'Deductions cannot be negative')
    .required('Deductions is required'),
  notes: Yup.string(),
});

// Profile Schemas
export const profileUpdateSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  phone: Yup.string()
    .matches(/^\+?[\d\s-]+$/, 'Invalid phone number')
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must not exceed 15 digits'),
  bio: Yup.string()
    .max(500, 'Bio must not exceed 500 characters'),
});

export const passwordChangeSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

// Document Schemas
export const documentSchema = Yup.object().shape({
  title: Yup.string()
    .min(2, 'Title must be at least 2 characters')
    .required('Title is required'),
  type: Yup.string()
    .required('Document type is required'),
  file: Yup.mixed()
    .required('File is required'),
});

export default {
  loginSchema,
  registerSchema,
  employeeSchema,
  leaveApplicationSchema,
  attendanceSchema,
  payrollSchema,
  profileUpdateSchema,
  passwordChangeSchema,
  documentSchema,
};
