const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'hr_manager', 'employee'],
    default: 'employee'
  },
  firstName: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    country: { type: String, default: '' }
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  bio: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: null
  },
  employeeCode: {
    type: String,
    default: ''
  },
  bloodGroup: {
    type: String,
    default: ''
  },
  personalInfo: {
    gender: { type: String, default: '' },
    age: { type: String, default: '' },
    emailOffice: { type: String, default: '' },
    phoneAlt: { type: String, default: '' },
    pan: { type: String, default: '' },
    aadhar: { type: String, default: '' },
    marital: { type: String, default: '' }
  },
  familyInfo: {
    fatherName: { type: String, default: '' },
    fatherAge: { type: String, default: '' },
    motherName: { type: String, default: '' },
    motherAge: { type: String, default: '' },
    spouseName: { type: String, default: '' },
    drivingLicense: { type: String, default: '' },
    passport: { type: String, default: '' },
    other: { type: String, default: '' }
  },
  // Employee Information (consolidated from Employee model)
  employeeCode: {
    type: String,
    unique: true,
    sparse: true // Allows null values to be non-unique
  },
  department: {
    type: String,
    default: ''
  },
  designation: {
    type: String,
    default: ''
  },
  employmentType: {
    type: String,
    enum: ['full_time', 'part_time', 'contract', 'intern', ''],
    default: ''
  },
  salary: {
    type: Number,
    default: 0
  },
  dateOfJoining: {
    type: Date,
    default: null
  },
  emergencyContact: {
    name: { type: String, default: '' },
    relationship: { type: String, default: '' },
    phone: { type: String, default: '' }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on_leave', 'terminated', ''],
    default: 'active'
  },
  documents: [{
    type: { type: String, default: '' },
    name: { type: String, default: '' },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  // Legacy jobInfo for backward compatibility
  jobInfo: {
    department: { type: String, default: '' },
    designation: { type: String, default: '' },
    employmentType: { type: String, default: '' },
    salary: { type: String, default: '' },
    joiningDate: { type: Date, default: null },
    reportingManager: { type: String, default: '' },
    workLocation: { type: String, default: '' },
    employeeType: { type: String, default: '' }
  },
  education: {
    highestQualification: { type: String, default: '' },
    university: { type: String, default: '' },
    graduationYear: { type: String, default: '' },
    percentage: { type: String, default: '' },
    specialization: { type: String, default: '' },
    additionalCertifications: { type: String, default: '' }
  },
  dependents: [{
    name: { type: String, default: '' },
    relationship: { type: String, default: '' },
    dateOfBirth: { type: Date, default: null },
    gender: { type: String, default: '' },
    isNominee: { type: Boolean, default: false }
  }],
  experience: [{
    companyName: { type: String, default: '' },
    designation: { type: String, default: '' },
    fromDate: { type: Date, default: null },
    toDate: { type: Date, default: null },
    salary: { type: String, default: '' },
    reasonForLeaving: { type: String, default: '' }
  }],
  epfInfo: {
    epfNumber: { type: String, default: '' },
    uanNumber: { type: String, default: '' },
    pfNominee: { type: String, default: '' },
    pfNomineeRelation: { type: String, default: '' },
    pfJoiningDate: { type: Date, default: null },
    previousPfNumber: { type: String, default: '' }
  },
  esiInfo: {
    esiNumber: { type: String, default: '' },
    esiNominee: { type: String, default: '' },
    esiNomineeRelation: { type: String, default: '' },
    dispensaryName: { type: String, default: '' },
    esiJoiningDate: { type: Date, default: null }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
