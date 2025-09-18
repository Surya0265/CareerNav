const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recentActivities: [
      {
        activityType: {
          type: String,
          enum: [
            'resume_upload',
            'resume_update',
            'job_application',
            'job_view',
            'resource_view',
            'resource_completion',
            'bookmark',
            'profile_update',
            'search',
            'login',
            'other',
          ],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        details: {
          itemId: mongoose.Schema.Types.ObjectId,
          itemType: String,
          metadata: Object,
        },
      },
    ],
    learningProgress: [
      {
        resourceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'LearningResource',
        },
        progress: {
          type: Number, // percentage
          min: 0,
          max: 100,
          default: 0,
        },
        startDate: Date,
        lastActivity: Date,
        completionDate: Date,
        assessmentScores: [
          {
            score: Number,
            date: Date,
            assessmentName: String,
          },
        ],
      },
    ],
    skillProgress: [
      {
        skillName: String,
        level: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        },
        startLevel: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        },
        progress: {
          type: Number, // percentage
          min: 0,
          max: 100,
        },
        lastUpdated: Date,
        resources: [
          {
            resourceId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'LearningResource',
            },
            completed: Boolean,
          },
        ],
      },
    ],
    jobApplications: [
      {
        jobId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Job',
        },
        status: {
          type: String,
          enum: ['applied', 'interviewing', 'offer', 'rejected', 'accepted', 'withdrawn'],
        },
        applicationDate: Date,
        lastStatusUpdate: Date,
        interviews: [
          {
            date: Date,
            type: String,
            notes: String,
            outcome: String,
          },
        ],
      },
    ],
    usagePatterns: {
      averageSessionDuration: Number, // in minutes
      sessionsPerWeek: Number,
      mostActiveTime: {
        dayOfWeek: Number, // 0-6, 0 is Sunday
        hourOfDay: Number, // 0-23
      },
      featureUsage: {
        resumeAnalysis: Number,
        jobSearch: Number,
        learningResources: Number,
        careerTimeline: Number,
        careerPlan: Number,
        content: Number,
      },
      deviceUsage: {
        mobile: Number,
        desktop: Number,
        tablet: Number,
      },
    },
    recommendationData: {
      interests: [String],
      dislikedItems: [
        {
          itemId: mongoose.Schema.Types.ObjectId,
          itemType: String,
        },
      ],
      preferredResourceTypes: [String],
      preferredContentTopics: [String],
      careerGoals: [String],
      searchHistory: [
        {
          query: String,
          timestamp: Date,
          resultCount: Number,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Analytics', AnalyticsSchema);
