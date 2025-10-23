const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  logActivity,
  getUserActivityLogs,
  getActivityStats,
  clearUserActivityLogs,
} = require('../utils/activityLogger');

/**
 * GET /api/activity-logs
 * Retrieve activity logs for the authenticated user
 */
router.get('/', protect, async (req, res) => {
  try {
    const { limit = 50, skip = 0, action = null, startDate = null, endDate = null } = req.query;

    const result = await getUserActivityLogs(req.user._id, {
      limit: parseInt(limit),
      skip: parseInt(skip),
      action,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    });

    // Log this access
    await logActivity({
      userId: req.user._id,
      action: 'OTHER',
      route: req.path,
      method: req.method,
      statusCode: 200,
      description: `Viewed activity logs (${result.logs.length} records)`,
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
      metadata: { limit, skip, action },
    });

    res.json({
      success: true,
      data: result.logs,
      pagination: {
        total: result.total,
        limit: result.limit,
        skip: result.skip,
        pages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve activity logs',
      details: error.message,
    });
  }
});

/**
 * GET /api/activity-logs/stats
 * Get activity statistics for the authenticated user
 */
router.get('/stats', protect, async (req, res) => {
  try {
    const { startDate = null, endDate = null } = req.query;

    const stats = await getActivityStats(
      req.user._id,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve activity statistics',
      details: error.message,
    });
  }
});

/**
 * DELETE /api/activity-logs
 * Clear all activity logs for the authenticated user (admin only)
 */
router.delete('/', protect, async (req, res) => {
  try {
    // Optional: Add admin check here if needed
    // if (req.user.role !== 'admin') { ... }

    const result = await clearUserActivityLogs(req.user._id);

    // Log the deletion
    await logActivity({
      userId: req.user._id,
      action: 'OTHER',
      route: req.path,
      method: req.method,
      statusCode: 200,
      description: `Cleared ${result.deletedCount} activity logs`,
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: `Successfully cleared ${result.deletedCount} activity logs`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error clearing activity logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear activity logs',
      details: error.message,
    });
  }
});

/**
 * Helper function to get client IP
 */
function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip ||
    'Unknown'
  );
}

module.exports = router;
