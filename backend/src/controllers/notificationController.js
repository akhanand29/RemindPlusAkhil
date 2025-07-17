// backend/src/controllers/notificationController.js
const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendPushNotification } = require('../utils/pushNotifications');
const { sendEmail } = require('../utils/emailService');

// @desc    Get all notifications for user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({
    success: true,
    count: notifications.length,
    data: notifications
  });
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ 
    user: req.user.id, 
    read: false 
  });

  res.json({
    success: true,
    count: count
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  if (notification.user.toString() !== req.user.id) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this notification'
    });
  }

  notification.read = true;
  notification.readAt = new Date();
  await notification.save();

  res.json({
    success: true,
    data: notification
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user.id, read: false },
    { 
      read: true, 
      readAt: new Date() 
    }
  );

  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  if (notification.user.toString() !== req.user.id) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to delete this notification'
    });
  }

  await notification.deleteOne();

  res.json({
    success: true,
    message: 'Notification deleted'
  });
});

// @desc    Clear all notifications
// @route   DELETE /api/notifications/clear-all
// @access  Private
const clearAllNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ user: req.user.id });

  res.json({
    success: true,
    message: 'All notifications cleared'
  });
});

// @desc    Get notification settings
// @route   GET /api/notifications/settings
// @access  Private
const getNotificationSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('notificationSettings');

  res.json({
    success: true,
    data: user.notificationSettings
  });
});

// @desc    Update notification settings
// @route   PUT /api/notifications/settings
// @access  Private
const updateNotificationSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  user.notificationSettings = {
    ...user.notificationSettings,
    ...req.body
  };

  await user.save();

  res.json({
    success: true,
    data: user.notificationSettings
  });
});

// @desc    Send test notification
// @route   POST /api/notifications/test
// @access  Private
const sendTestNotification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const notification = new Notification({
    user: user._id,
    title: 'Test Notification',
    message: 'This is a test notification from Task Reminder',
    type: 'test'
  });

  await notification.save();

  // Send push notification if enabled
  if (user.notificationSettings.pushNotifications && user.fcmToken) {
    await sendPushNotification(user.fcmToken, {
      title: notification.title,
      body: notification.message,
      data: {
        type: notification.type,
        notificationId: notification._id.toString()
      }
    });
  }

  res.json({
    success: true,
    message: 'Test notification sent',
    data: notification
  });
});

// @desc    Register/Update FCM token
// @route   POST /api/notifications/register-token
// @access  Private
const registerFCMToken = asyncHandler(async (req, res) => {
  const { fcmToken } = req.body;

  if (!fcmToken) {
    return res.status(400).json({
      success: false,
      message: 'FCM token is required'
    });
  }

  const user = await User.findById(req.user.id);
  user.fcmToken = fcmToken;
  await user.save();

  res.json({
    success: true,
    message: 'FCM token registered successfully'
  });
});

// @desc    Update FCM token (alias for registerFCMToken)
// @route   PUT /api/notifications/fcm-token
// @access  Private
const updateFCMToken = asyncHandler(async (req, res) => {
  const { fcmToken } = req.body;

  if (!fcmToken) {
    return res.status(400).json({
      success: false,
      message: 'FCM token is required'
    });
  }

  const user = await User.findById(req.user.id);
  user.fcmToken = fcmToken;
  await user.save();

  res.json({
    success: true,
    message: 'FCM token updated successfully'
  });
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getNotificationSettings,
  updateNotificationSettings,
  sendTestNotification,
  registerFCMToken,
  updateFCMToken
};