const mongoose = require('mongoose');

const LearningResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    provider: {
      name: String,
      website: String,
      logo: String,
    },
    duration: {
      value: Number,
      unit: {
        type: String,
        enum: ['minutes', 'hours', 'days', 'weeks', 'months'],
        default: 'hours',
      },
    },
    cost: {
      value: Number,
      currency: {
        type: String,
        default: 'USD',
      },
      isFree: {
        type: Boolean,
        default: false,
      },
      hasTrial: {
        type: Boolean,
        default: false,
      },
    },
    type: {
      type: String,
      required: [true, 'Please specify resource type'],
      enum: ['video', 'course', 'tutorial', 'article', 'book', 'podcast', 'webinar', 'other'],
    },
    format: {
      type: String,
      enum: ['online', 'in-person', 'hybrid', 'downloadable', 'text'],
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    topics: [String],
    skills: [
      {
        name: String,
        level: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        },
      },
    ],
    prerequisites: [String],
    learningOutcomes: [String],
    rating: {
      average: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    reviews: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    externalLink: {
      type: String,
      required: [true, 'Please add an external link'],
    },
    image: String,
    tags: [String],
    popularity: {
      views: {
        type: Number,
        default: 0,
      },
      completions: {
        type: Number,
        default: 0,
      },
      saves: {
        type: Number,
        default: 0,
      },
    },
    publishedDate: Date,
    lastUpdated: Date,
    isRecommended: {
      type: Boolean,
      default: false,
    },
    relatedResources: [
      {
        resourceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'LearningResource',
        },
        relationship: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LearningResource', LearningResourceSchema);
