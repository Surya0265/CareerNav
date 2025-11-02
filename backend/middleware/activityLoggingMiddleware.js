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
        const action = getActionFromRoute(req.path, req.method);
        console.log(`[Activity Logger FINAL] Path: ${req.path}, Method: ${req.method}, Action: ${action}`);
        
        logActivity({
          userId: req.user._id,
          action: action,
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
  // Debug: Log what path we're checking
  console.log(`[Activity Logger] Checking path: "${path}", Method: ${method}`);
  
  // Auth routes
  if (path.includes('/auth/login')) return 'LOGIN';
  if (path.includes('/auth/logout')) return 'LOGOUT';
  if (path.includes('/auth/signup')) return 'SIGNUP';
  if (path.includes('/auth/verify-email') || path.includes('/verify')) return 'EMAIL_VERIFICATION';
  
  // Password routes
  if (path.includes('/password/reset')) return 'PASSWORD_RESET';
  if (path.includes('/password/change')) return 'PASSWORD_CHANGE';
  if (path.includes('/forgot-password')) return 'PASSWORD_RESET';
  
  // Resume routes - /api/resume/* or /resume/* (relative) or /upload, /finalize, /latest, /cleanup
  if (path.includes('/resume') || path.includes('/upload') || path.includes('/finalize') || path.includes('/cleanup')) {
    console.log('[Activity Logger] MATCHED RESUME');
    if (path.includes('/upload')) return 'RESUME_UPLOAD';
    if (path.includes('/finalize')) return 'RESUME_ANALYZE';
    if (path.includes('/cleanup')) return 'RESUME_DELETE';
    if (method === 'DELETE') return 'RESUME_DELETE';
    if (path.includes('/latest') || method === 'GET') return 'RESUME_VIEW';
    if (method === 'POST') return 'RESUME_UPLOAD';
    return 'RESUME_VIEW';
  }
  
  // AI/Extract Skills (treat as RESUME_ANALYZE) - /api/ai/* or /ai/* (relative) or /extract-skills, /upload-resume
  if (path.includes('/ai') || path.includes('/extract') || path.includes('/upload-resume')) {
    console.log('[Activity Logger] MATCHED AI/EXTRACT');
    return 'RESUME_ANALYZE';
  }
  
  // Timeline routes - /api/timeline/* or /generate-timeline, /generate-plan, /complete-phase, /regenerate (relative)
  if (path.includes('/timeline') || path.includes('/generate-timeline') || path.includes('/generate-plan') || path.includes('/complete-phase') || path.includes('/regenerate')) {
    console.log('[Activity Logger] MATCHED TIMELINE');
    if (path.includes('/generate')) return 'TIMELINE_CREATE';
    if (path.includes('/complete-phase')) return 'TIMELINE_UPDATE';
    if (path.includes('/regenerate')) return 'TIMELINE_UPDATE';
    if (path.includes('/history')) return 'TIMELINE_VIEW';
    if (method === 'GET') return 'TIMELINE_VIEW';
    if (method === 'POST') return 'TIMELINE_CREATE';
    if (method === 'PUT' || method === 'PATCH') return 'TIMELINE_UPDATE';
    if (method === 'DELETE') return 'TIMELINE_DELETE';
    return 'TIMELINE_CREATE';
  }
  
  // Job recommendation routes - /api/jobs/* or /jobs-by-resume, /jobs-by-skills, /jobs-search, /history (relative)
  if (path.includes('/jobs') || path.includes('/jobs-by') || path.includes('/jobs-search')) {
    console.log('[Activity Logger] MATCHED JOBS');
    if (path.includes('/history')) return 'JOB_RECOMMENDATION_VIEW';
    if (method === 'POST') return 'JOB_RECOMMENDATION_VIEW';
    return 'JOB_RECOMMENDATION_VIEW';
  }
  
  // YouTube recommendation routes - /api/youtube/* or /recommendations, /history (relative)
  if (path.includes('/youtube') || path.includes('/recommendations')) {
    console.log('[Activity Logger] MATCHED YOUTUBE');
    if (path.includes('/history')) return 'YOUTUBE_RECOMMENDATION_VIEW';
    if (path.includes('/recommendations')) return 'YOUTUBE_RECOMMENDATION_VIEW';
    if (method === 'POST') return 'YOUTUBE_RECOMMENDATION_VIEW';
    return 'YOUTUBE_RECOMMENDATION_VIEW';
  }
  
  // User profile routes - /api/users/profile* or /profile* (relative)
  if (path.includes('/profile')) {
    if (method === 'PUT' || method === 'PATCH') return 'PROFILE_UPDATE';
    return 'PROFILE_UPDATE';
  }
  
  // Skills routes - /api/skills/* or /skills/* (relative)
  if (path.includes('/skills')) return 'SKILLS_UPDATE';
  
  // Settings routes
  if (path.includes('/settings')) return 'SETTINGS_UPDATE';
  
  // Preferences routes
  if (path.includes('/preferences')) return 'PREFERENCES_UPDATE';
  
  // User account routes
  if (path.includes('/account/delete') || path.includes('/delete')) return 'ACCOUNT_DELETE';
  if (path.includes('/email/change')) return 'EMAIL_CHANGE';
  
  // Bookmarks/Content
  if (path.includes('/bookmark')) return 'PROFILE_UPDATE';
  if (path.includes('/content')) return 'PROFILE_UPDATE';
  
  console.log(`[Activity Logger] NO MATCH for path: "${path}" - returning OTHER`);
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
