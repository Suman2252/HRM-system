const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  type: {
    type: String,
    enum: [
      'leave_request',
      'leave_approved',
      'leave_rejected',
      'payroll_generated',
      'attendance_reminder',
      'birthday_reminder',
      'work_anniversary',
      'system_announcement',
      'document_upload',
      'profile_update',
      'password_change',
      'employee_onboarding',
      'employee_offboarding',
      'meeting_reminder',
      'task_assignment',
      'deadline_reminder',
      'overtime_approval',
      'general'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'archived'],
    default: 'unread'
  },
  readAt: {
    type: Date,
    default: null
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  },
  channels: [{
    type: String,
    enum: ['in_app', 'email', 'sms', 'push'],
    default: 'in_app'
  }],
  emailSent: {
    type: Boolean,
    default: false
  },
  smsSent: {
    type: Boolean,
    default: false
  },
  pushSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
notificationSchema.index({ recipient: 1, status: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ priority: 1 });

// TTL index to automatically delete expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Mark notification as read
notificationSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

// Mark notification as archived
notificationSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  await notification.save();
  
  // Here you could add real-time notification logic (WebSocket, etc.)
  // For now, we'll just return the notification
  return notification;
};

// Static method to create bulk notifications
notificationSchema.statics.createBulkNotifications = async function(recipients, notificationData) {
  const notifications = recipients.map(recipientId => ({
    ...notificationData,
    recipient: recipientId
  }));
  
  return await this.insertMany(notifications);
};

// Static method to get unread count for a user
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({
    recipient: userId,
    status: 'unread'
  });
};

// Static method to get notifications for a user with pagination
notificationSchema.statics.getUserNotifications = async function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    status = null,
    type = null,
    priority = null
  } = options;
  
  const query = { recipient: userId };
  
  if (status) query.status = status;
  if (type) query.type = type;
  if (priority) query.priority = priority;
  
  const notifications = await this.find(query)
    .populate('sender', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  
  const total = await this.countDocuments(query);
  
  return {
    notifications,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  };
};

// Static method to mark all notifications as read for a user
notificationSchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { recipient: userId, status: 'unread' },
    { status: 'read', readAt: new Date() }
  );
};

// Static method to clean up old notifications
notificationSchema.statics.cleanupOldNotifications = async function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return await this.deleteMany({
    createdAt: { $lt: cutoffDate },
    status: { $in: ['read', 'archived'] }
  });
};

// Pre-save middleware to set expiration for certain notification types
notificationSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    // Set expiration based on notification type
    const expirationDays = {
      'attendance_reminder': 1,
      'meeting_reminder': 1,
      'deadline_reminder': 7,
      'birthday_reminder': 3,
      'system_announcement': 30
    };
    
    if (expirationDays[this.type]) {
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + expirationDays[this.type]);
      this.expiresAt = expireDate;
    }
  }
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);
