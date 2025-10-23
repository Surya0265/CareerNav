const { logActivity } = require('../utils/activityLogger');

/**
 * Middleware to log all API requests
 * Captures route, method, user, timestamp, and other details
 */
async function activityLoggingMiddleware(req, res, next) {
  // Store original response methods
  const originalJson = res.json;
  const originalSend = res.send;
  let statusCode = res.statusCode;

  // Override res.json to capture status code and log after response
  res.json = function(data) {
    statusCode = res.statusCode;
    
    // Log the activity after response
    if (req.user?._id) {
      // Don't log auth routes with sensitive data
      if (!req.path.includes('/login') && !req.path.includes('/password')) {
        logActivity({
          userId: req.user._id,
          action: getActionFromRoute(req.path, req.method),
          route: req.path,
          method: req.method,
          statusCode: statusCode,
          description: `${req.method} ${req.path}`,
          ipAddress: getClientIp(req),
          userAgent: req.get('user-agent'),
          metadata: {
            // Include relevant metadata based on route
            query: req.query,
            params: req.params,
          },
        }).catch(err => {
          console.error('Failed to log activity:', err);
        });
      }
    }

    // Call original json method
    return originalJson.call(this, data);
  };

  // Override res.send for non-json responses
  res.send = function(data) {
    statusCode = res.statusCode;
    
    // Log error responses
    if (statusCode >= 400 && req.user?._id) {
      logActivity({
        userId: req.user._id,
        action: getActionFromRoute(req.path, req.method),
        route: req.path,
        method: req.method,
        statusCode: statusCode,
        description: `${req.method} ${req.path} - Error`,
        ipAddress: getClientIp(req),
        userAgent: req.get('user-agent'),
        errorMessage: typeof data === 'string' ? data : JSON.stringify(data),
      }).catch(err => {
        console.error('Failed to log activity:', err);
      });
    }

    return originalSend.call(this, data);
  };

  next();
}

/**
 * Extract action type from route and method
 */
function getActionFromRoute(path, method) {
  if (path.includes('/auth/login')) return 'LOGIN';
  if (path.includes('/auth/logout')) return 'LOGOUT';
  if (path.includes('/auth/signup')) return 'SIGNUP';
  if (path.includes('/auth/verify-email')) return 'EMAIL_VERIFICATION';
  if (path.includes('/password/reset')) return 'PASSWORD_RESET';
  if (path.includes('/password/change')) return 'PASSWORD_CHANGE';
  if (path.includes('/resume/upload')) return 'RESUME_UPLOAD';
  if (path.includes('/resume') && method === 'GET') return 'RESUME_VIEW';
  if (path.includes('/resume') && method === 'DELETE') return 'RESUME_DELETE';
  if (path.includes('/ai/upload-resume')) return 'RESUME_ANALYZE';
  if (path.includes('/timeline') && method === 'POST') return 'TIMELINE_CREATE';
  if (path.includes('/timeline') && method === 'PUT') return 'TIMELINE_UPDATE';
  if (path.includes('/timeline') && method === 'DELETE') return 'TIMELINE_DELETE';
  if (path.includes('/jobs')) return 'JOB_RECOMMENDATION_VIEW';
  if (path.includes('/youtube')) return 'YOUTUBE_RECOMMENDATION_VIEW';
  if (path.includes('/users/profile') && method === 'PUT') return 'PROFILE_UPDATE';
  if (path.includes('/skills')) return 'SKILLS_UPDATE';
  if (path.includes('/settings')) return 'SETTINGS_UPDATE';
  return 'OTHER';
}

/**
 * Get client IP address from request
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

module.exports = activityLoggingMiddleware;
