const express = require('express');
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  verifyAdminEmail,
  resendVerificationEmail,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  forgotAdminPassword,
  resetAdminPassword,
} = require('../controllers/adminController');
const {
  getAllActivityLogs,
  getActivityLogById,
  getActivityLogAnalytics,
  getLogsByAction,
  exportLogs,
  cleanupOldLogs,
} = require('../controllers/adminLogsController');
const { protectAdmin, checkAdminPermission, superAdminOnly } = require('../middleware/adminAuthMiddleware');

// Public routes
router.post('/signup', registerAdmin);
router.post('/login', loginAdmin);
router.get('/verify', verifyAdminEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/forgot-password', forgotAdminPassword);
router.post('/reset-password', resetAdminPassword);

// Protected routes (require admin authentication)
router.use(protectAdmin); // All routes below require admin auth

// Admin profile routes
router.route('/profile')
  .get(getAdminProfile)
  .put(updateAdminProfile);

router.put('/change-password', changeAdminPassword);

// Activity logs routes
router.get(
  '/logs',
  checkAdminPermission('viewLogs'),
  getAllActivityLogs
);

router.get(
  '/logs/analytics/stats',
  checkAdminPermission('viewLogs'),
  getActivityLogAnalytics
);

router.get(
  '/logs/:id',
  checkAdminPermission('viewLogs'),
  getActivityLogById
);

router.get(
  '/logs/action/:action',
  checkAdminPermission('viewLogs'),
  getLogsByAction
);

router.get(
  '/logs/export',
  checkAdminPermission('viewLogs'),
  exportLogs
);

router.delete(
  '/logs/cleanup',
  superAdminOnly,
  cleanupOldLogs
);

module.exports = router;
