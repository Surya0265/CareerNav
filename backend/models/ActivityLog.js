const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: [
        'LOGIN',
        'LOGOUT',
        'SIGNUP',
        'PASSWORD_RESET',
        'PASSWORD_CHANGE',
        'EMAIL_VERIFICATION',
        'RESUME_UPLOAD',
        'RESUME_ANALYZE',
        'RESUME_DELETE',
        'PROFILE_UPDATE',
        'SKILLS_UPDATE',
        'PREFERENCES_UPDATE',
        'TIMELINE_CREATE',
        'TIMELINE_UPDATE',
        'TIMELINE_DELETE',
        'JOB_RECOMMENDATION_VIEW',
        'YOUTUBE_RECOMMENDATION_VIEW',
        'SETTINGS_UPDATE',
        'ACCOUNT_DELETE',
        'EMAIL_CHANGE',
        'API_ERROR',
        'UNAUTHORIZED_ACCESS',
        'OTHER',
      ],
    },
    route: {
      type: String,
      required: [true, 'Route is required'],
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      required: [true, 'HTTP method is required'],
    },
    statusCode: {
      type: Number,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    ipAddress: {
      type: String,
      required: false,
    },
    userAgent: {
      type: String,
      required: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    errorMessage: {
      type: String,
      required: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false, // We're using our own timestamp field
  }
);

// Index for efficient querying
ActivityLogSchema.index({ userId: 1, timestamp: -1 });
ActivityLogSchema.index({ action: 1, timestamp: -1 });

// Expire logs after 90 days
ActivityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);
console.log('ActivityLog model registered with Mongoose');

module.exports = ActivityLog;
