const ActivityLog = require('../models/ActivityLog');

/**
 * Log user activity with comprehensive details
 * @param {Object} options - Logging options
 * @param {string} options.userId - User ID (ObjectId)
 * @param {string} options.action - Action type (enum)
 * @param {string} options.route - API route accessed
 * @param {string} options.method - HTTP method (GET, POST, etc.)
 * @param {number} options.statusCode - HTTP status code
 * @param {string} options.description - Human-readable description
 * @param {string} options.ipAddress - Client IP address
 * @param {string} options.userAgent - Client user agent
 * @param {Object} options.metadata - Additional metadata
 * @param {string} options.errorMessage - Error message if applicable
 */
async function logActivity({
  userId,
  action = 'OTHER',
  route,
  method = 'GET',
  statusCode,
  description,
  ipAddress,
  userAgent,
  metadata = {},
  errorMessage = null,
}) {
  try {
    const log = new ActivityLog({
      userId,
      action,
      route,
      method,
      statusCode,
      description,
      ipAddress,
      userAgent,
      metadata,
      errorMessage,
      timestamp: new Date(),
    });

    await log.save();
    console.log(`[ACTIVITY LOG] ${action} by user ${userId} on ${route}`);
    return log;
  } catch (error) {
    console.error('[ACTIVITY LOG ERROR] Failed to save activity log:', error.message);
    // Don't throw - logging should never break the app
    return null;
  }
}

/**
 * Get activity logs for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of logs to return (default: 50)
 * @param {number} options.skip - Number of logs to skip (default: 0)
 * @param {string} options.action - Filter by action (optional)
 * @param {Date} options.startDate - Filter from date (optional)
 * @param {Date} options.endDate - Filter to date (optional)
 */
async function getUserActivityLogs(
  userId,
  {
    limit = 50,
    skip = 0,
    action = null,
    startDate = null,
    endDate = null,
  } = {}
) {
  try {
    const query = { userId };

    if (action) {
      query.action = action;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = startDate;
      }
      if (endDate) {
        query.timestamp.$lte = endDate;
      }
    }

    const logs = await ActivityLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await ActivityLog.countDocuments(query);

    return {
      logs,
      total,
      limit,
      skip,
    };
  } catch (error) {
    console.error('[ACTIVITY LOG ERROR] Failed to retrieve activity logs:', error.message);
    throw error;
  }
}

/**
 * Get activity statistics for a user
 * @param {string} userId - User ID
 * @param {Date} startDate - Start date for stats
 * @param {Date} endDate - End date for stats
 */
async function getActivityStats(userId, startDate = null, endDate = null) {
  try {
    const query = { userId };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = startDate;
      }
      if (endDate) {
        query.timestamp.$lte = endDate;
      }
    }

    const stats = await ActivityLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          lastOccurrence: { $max: '$timestamp' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return stats;
  } catch (error) {
    console.error('[ACTIVITY LOG ERROR] Failed to get activity stats:', error.message);
    throw error;
  }
}

/**
 * Clear activity logs for a user (useful for testing or privacy)
 * @param {string} userId - User ID
 */
async function clearUserActivityLogs(userId) {
  try {
    const result = await ActivityLog.deleteMany({ userId });
    console.log(`[ACTIVITY LOG] Cleared ${result.deletedCount} logs for user ${userId}`);
    return result;
  } catch (error) {
    console.error('[ACTIVITY LOG ERROR] Failed to clear activity logs:', error.message);
    throw error;
  }
}

module.exports = {
  logActivity,
  getUserActivityLogs,
  getActivityStats,
  clearUserActivityLogs,
};
