const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth'); // Fixed: destructure auth from the exported object

// All routes require authentication
router.use(auth);

// GET /api/notifications/unread-count - Get unread notification count (before /:id routes)
router.get('/unread-count', notificationController.getUnreadCount);

// GET /api/notifications - Get all notifications for user
router.get('/', notificationController.getNotifications);

// POST /api/notifications/register-token - Register FCM token
router.post('/register-token', notificationController.registerFCMToken);

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', notificationController.markAllAsRead);

// DELETE /api/notifications/clear-all - Clear all notifications
router.delete('/clear-all', notificationController.clearAllNotifications);

// POST /api/notifications/test - Send test notification
router.post('/test', notificationController.sendTestNotification);

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', notificationController.markAsRead);

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;