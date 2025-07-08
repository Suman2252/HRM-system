import { useFormik } from 'formik';
import * as Yup from 'yup';

const useFormValidation = ({
  initialValues,
  validationSchema,
  onSubmit,
  enableReinitialize = false,
}) => {
  // Common validation schemas
  const schemas = {
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
    
    phone: Yup.string()
      .matches(/^\+?[\d\s-]+$/, 'Invalid phone number')
      .min(10, 'Phone number must be at least 10 digits')
      .max(15, 'Phone number must not exceed 15 digits'),
    
    date: Yup.date()
      .max(new Date(), 'Date cannot be in the future')
      .required('Date is required'),
    
    amount: Yup.number()
      .positive('Amount must be positive')
      .required('Amount is required'),
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
    enableReinitialize,
  });

  // Helper function to check if a field has an error
  const hasError = (fieldName) => 
    formik.touched[fieldName] && formik.errors[fieldName];

  // Helper function to get error message
  const getErrorMessage = (fieldName) => 
    hasError(fieldName) ? formik.errors[fieldName] : '';

  // Helper function to get field props
  const getFieldProps = (fieldName) => ({
    ...formik.getFieldProps(fieldName),
    error: hasError(fieldName),
    helperText: getErrorMessage(fieldName),
  });

  return {
    formik,
    schemas,
    hasError,
    getErrorMessage,
    getFieldProps,
    // Expose commonly used formik properties
    values: formik.values,
    errors: formik.errors,
    touched: formik.touched,
    isSubmitting: formik.isSubmitting,
    isValid: formik.isValid,
    dirty: formik.dirty,
    handleSubmit: formik.handleSubmit,
    handleChange: formik.handleChange,
    handleBlur: formik.handleBlur,
    setFieldValue: formik.setFieldValue,
    setFieldTouched: formik.setFieldTouched,
    resetForm: formik.resetForm,
  };
};

export default useFormValidation;
