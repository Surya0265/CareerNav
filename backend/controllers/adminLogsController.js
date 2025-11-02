const ActivityLog = require('../models/ActivityLog');

/**
 * @desc   Get all activity logs with filtering, pagination, and analytics
 * @route  GET /api/admin/logs
 * @access Protected (admin)
 */
exports.getAllActivityLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      action,
      userId,
      startDate,
      endDate,
      search,
      sortBy = 'timestamp',
      order = 'desc',
    } = req.query;

    // Build filter object
    const filter = {};

    if (action) {
      filter.action = action;
    }

    if (userId) {
      filter.userId = userId;
    }

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.timestamp.$lte = end;
      }
    }

    if (search) {
      filter.$or = [
        { route: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'metadata.userName': { $regex: search, $options: 'i' } },
        { 'metadata.userEmail': { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    // Get total count
    const totalLogs = await ActivityLog.countDocuments(filter);

    // Get logs with pagination
    const logs = await ActivityLog.find(filter)
      .populate('userId', 'name email')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        total: totalLogs,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalLogs / limit),
      },
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching activity logs',
      details: error.message,
    });
  }
};

/**
 * @desc   Get activity log details by ID
 * @route  GET /api/admin/logs/:id
 * @access Protected (admin)
 */
exports.getActivityLogById = async (req, res) => {
  try {
    const log = await ActivityLog.findById(req.params.id).populate(
      'userId',
      'name email'
    );

    if (!log) {
      return res.status(404).json({
        success: false,
        error: 'Activity log not found',
      });
    }

    res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    console.error('Get activity log error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching activity log',
      details: error.message,
    });
  }
};

/**
 * @desc   Get activity log statistics and analytics
 * @route  GET /api/admin/logs/analytics/stats
 * @access Protected (admin)
 */
exports.getActivityLogAnalytics = async (req, res) => {
  try {
    const { days = 7 } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const filter = {
      timestamp: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    // Total logs count
    const totalLogs = await ActivityLog.countDocuments(filter);

    // Logs by action
    const logsByAction = await ActivityLog.aggregate([
      { $match: filter },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Logs by HTTP method
    const logsByMethod = await ActivityLog.aggregate([
      { $match: filter },
      { $group: { _id: '$method', count: { $sum: 1 } } },
    ]);

    // Logs by status code
    const logsByStatusCode = await ActivityLog.aggregate([
      { $match: filter },
      { $group: { _id: '$statusCode', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Logs over time (grouped by date)
    const logsByDate = await ActivityLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp',
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Most active users
    const topUsers = await ActivityLog.aggregate([
      { $match: filter },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          userName: '$user.name',
          userEmail: '$user.email',
          count: 1,
        },
      },
    ]);

    // Error rate
    const errorLogs = await ActivityLog.countDocuments({
      ...filter,
      statusCode: { $gte: 400 },
    });

    const errorRate = totalLogs > 0 ? ((errorLogs / totalLogs) * 100).toFixed(2) : 0;

    // Most accessed routes
    const topRoutes = await ActivityLog.aggregate([
      { $match: filter },
      { $group: { _id: '$route', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalLogs,
        errorRate: parseFloat(errorRate),
        errorCount: errorLogs,
        logsByAction,
        logsByMethod,
        logsByStatusCode,
        logsByDate,
        topUsers,
        topRoutes,
        dateRange: {
          startDate,
          endDate,
          days: parseInt(days),
        },
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching analytics',
      details: error.message,
    });
  }
};

/**
 * @desc   Get logs by specific action
 * @route  GET /api/admin/logs/action/:action
 * @access Protected (admin)
 */
exports.getLogsByAction = async (req, res) => {
  try {
    const { action } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const totalLogs = await ActivityLog.countDocuments({ action });

    const logs = await ActivityLog.find({ action })
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        total: totalLogs,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalLogs / limit),
      },
    });
  } catch (error) {
    console.error('Get logs by action error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching logs by action',
      details: error.message,
    });
  }
};

/**
 * @desc   Export logs (CSV)
 * @route  GET /api/admin/logs/export
 * @access Protected (admin)
 */
exports.exportLogs = async (req, res) => {
  try {
    const { action, startDate, endDate } = req.query;

    const filter = {};

    if (action) filter.action = action;

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.timestamp.$lte = end;
      }
    }

    const logs = await ActivityLog.find(filter)
      .populate('userId', 'name email')
      .sort({ timestamp: -1 });

    // Convert to CSV
    let csv = 'Timestamp,User,Email,Action,Route,Method,Status Code,Description,Error Message\n';

    logs.forEach((log) => {
      const timestamp = log.timestamp.toISOString();
      const userName = log.userId?.name || 'Unknown';
      const userEmail = log.userId?.email || 'Unknown';
      const action = log.action;
      const route = log.route;
      const method = log.method;
      const statusCode = log.statusCode;
      const description = (log.description || '').replace(/"/g, '""');
      const errorMessage = (log.errorMessage || '').replace(/"/g, '""');

      csv += `${timestamp},"${userName}","${userEmail}",${action},${route},${method},${statusCode},"${description}","${errorMessage}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="activity_logs_${Date.now()}.csv"`
    );
    res.send(csv);
  } catch (error) {
    console.error('Export logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Error exporting logs',
      details: error.message,
    });
  }
};

/**
 * @desc   Delete old logs (cleanup)
 * @route  DELETE /api/admin/logs/cleanup
 * @access Protected (admin with manageAdmin permission)
 */
exports.cleanupOldLogs = async (req, res) => {
  try {
    const { daysOld = 90 } = req.body;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(daysOld));

    const result = await ActivityLog.deleteMany({
      timestamp: { $lt: cutoffDate },
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} old logs`,
      data: {
        deletedCount: result.deletedCount,
        cutoffDate,
      },
    });
  } catch (error) {
    console.error('Cleanup logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Error cleaning up logs',
      details: error.message,
    });
  }
};
