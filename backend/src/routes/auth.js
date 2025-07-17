const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, optionalAuth } = require('../middleware/auth');

// POST /api/auth/register - Register new user
router.post('/register', authController.register);

// POST /api/auth/login - Login user
router.post('/login', authController.login);

// POST /api/auth/logout - Logout user (requires auth)
router.post('/logout', auth, authController.logout);

// GET /api/auth/me - Get current user profile (requires auth)
router.get('/me', auth, authController.getProfile);

// PUT /api/auth/me - Update user profile (requires auth)
router.put('/me', auth, authController.updateProfile);

// POST /api/auth/forgot-password - Send password reset email
router.post('/forgot-password', authController.forgotPassword);

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', authController.resetPassword);

// POST /api/auth/verify-email - Verify email address
router.post('/verify-email', authController.verifyEmail);

// POST /api/auth/resend-verification - Resend email verification
router.post('/resend-verification', auth, authController.resendVerification);

// POST /api/auth/change-password - Change password (requires auth)
router.post('/change-password', auth, authController.changePassword);

// POST /api/auth/refresh-token - Refresh JWT token
router.post('/refresh-token', authController.refreshToken);

// DELETE /api/auth/account - Delete user account (requires auth)
router.delete('/account', auth, authController.deleteAccount);

// POST /api/auth/fcm-token - Save FCM token for push notifications
router.post('/fcm-token', auth, authController.saveFCMToken);

// DELETE /api/auth/fcm-token - Remove FCM token
router.delete('/fcm-token', auth, authController.removeFCMToken);

module.exports = router;