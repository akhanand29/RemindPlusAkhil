const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  type: {
    type: String,
    enum: ['reminder', 'overdue', 'completed', 'assigned', 'comment'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveryMethod: {
    type: String,
    enum: ['push', 'email', 'sms', 'in-app'],
    default: 'in-app'
  },
  scheduledFor: {
    type: Date,
    default: Date.now
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  readAt: {
    type: Date,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient querying
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ scheduledFor: 1, isDelivered: 1 });

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  
  if (this.isModified('isDelivered') && this.isDelivered && !this.deliveredAt) {
    this.deliveredAt = new Date();
  }
  
  next();
});

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = function(userId, notificationIds) {
  return this.updateMany(
    { 
      userId, 
      _id: { $in: notificationIds },
      isRead: false 
    },
    { 
      isRead: true, 
      readAt: new Date() 
    }
  );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ userId, isRead: false });
};

module.exports = mongoose.model('Notification', notificationSchema);