// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  VERIFY_EMAIL: '/api/auth/verify-email',
  
  // User
  PROFILE: '/api/users/profile',
  UPDATE_PROFILE: '/api/users/profile',
  CHANGE_PASSWORD: '/api/users/change-password',
  
  // Employees
  EMPLOYEES: '/api/employees',
  EMPLOYEE_DETAILS: (id) => `/api/employees/${id}`,
  EMPLOYEE_DOCUMENTS: (id) => `/api/employees/${id}/documents`,
  
  // Attendance
  ATTENDANCE: '/api/attendance',
  CLOCK_IN: '/api/attendance/clock-in',
  CLOCK_OUT: '/api/attendance/clock-out',
  ATTENDANCE_REPORT: '/api/attendance/report',
  
  // Leave
  LEAVE: '/api/leave',
  LEAVE_REQUESTS: '/api/leave/requests',
  LEAVE_BALANCE: '/api/leave/balance',
  
  // Payroll
  PAYROLL: '/api/payroll',
  GENERATE_PAYROLL: '/api/payroll/generate',
  PAYSLIP: (id) => `/api/payroll/${id}/payslip`,
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  HR_MANAGER: 'hr_manager',
  EMPLOYEE: 'employee',
};

// Leave types
export const LEAVE_TYPES = {
  ANNUAL: 'annual',
  SICK: 'sick',
  PERSONAL: 'personal',
  MATERNITY: 'maternity',
  PATERNITY: 'paternity',
  UNPAID: 'unpaid',
};

// Leave status
export const LEAVE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

// Attendance status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  HALF_DAY: 'half_day',
  ON_LEAVE: 'on_leave',
  HOLIDAY: 'holiday',
};

// Employee status
export const EMPLOYEE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ON_LEAVE: 'on_leave',
  TERMINATED: 'terminated',
};

// Payroll status
export const PAYROLL_STATUS = {
  DRAFT: 'draft',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

// Document types
export const DOCUMENT_TYPES = {
  RESUME: 'resume',
  ID_PROOF: 'id_proof',
  ADDRESS_PROOF: 'address_proof',
  EDUCATION: 'education',
  EXPERIENCE: 'experience',
  OTHER: 'other',
};

// Departments
export const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Customer Support',
  'Human Resources',
  'Finance',
  'Operations',
  'Legal',
];

// Designations
export const DESIGNATIONS = [
  'CEO',
  'CTO',
  'Manager',
  'Team Lead',
  'Senior Developer',
  'Developer',
  'Designer',
  'Product Manager',
  'HR Manager',
  'Finance Manager',
];

// Employment types
export const EMPLOYMENT_TYPES = {
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  CONTRACT: 'contract',
  INTERN: 'intern',
};

// File upload limits
export const FILE_LIMITS = {
  IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  DOCUMENT_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [10, 25, 50, 100],
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  API: 'yyyy-MM-dd',
  TIME: 'HH:mm',
  DATETIME: 'MMM dd, yyyy HH:mm',
};

// Theme
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Password must be at least 6 characters',
  PASSWORDS_NOT_MATCH: 'Passwords do not match',
  INVALID_PHONE: 'Please enter a valid phone number',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful',
  LOGOUT: 'Logout successful',
  PROFILE_UPDATE: 'Profile updated successfully',
  PASSWORD_CHANGE: 'Password changed successfully',
  LEAVE_APPLY: 'Leave application submitted successfully',
  ATTENDANCE_MARKED: 'Attendance marked successfully',
};

// Chart colors
export const CHART_COLORS = {
  PRIMARY: '#30475e',
  SECONDARY: '#f2a365',
  SUCCESS: '#4caf50',
  WARNING: '#ff9800',
  DANGER: '#f44336',
  INFO: '#2196f3',
};

export default {
  API_ENDPOINTS,
  USER_ROLES,
  LEAVE_TYPES,
  LEAVE_STATUS,
  ATTENDANCE_STATUS,
  EMPLOYEE_STATUS,
  PAYROLL_STATUS,
  DOCUMENT_TYPES,
  DEPARTMENTS,
  DESIGNATIONS,
  EMPLOYMENT_TYPES,
  FILE_LIMITS,
  PAGINATION,
  DATE_FORMATS,
  THEME,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  CHART_COLORS,
};
