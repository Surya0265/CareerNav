const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a job title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a job description'],
    },
    requirements: {
      type: [String],
      required: [true, 'Please add job requirements'],
    },
    preferredQualifications: [String],
    responsibilities: [String],
    company: {
      name: {
        type: String,
        required: [true, 'Please add a company name'],
      },
      logo: String,
      website: String,
      location: {
        address: String,
        city: String,
        state: String,
        country: String,
        zipCode: String,
        coordinates: {
          latitude: Number,
          longitude: Number,
        },
      },
      size: String,
      industry: String,
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'remote', 'contract', 'hybrid'],
      required: [true, 'Please specify job type'],
    },
    salaryRange: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'USD',
      },
      period: {
        type: String,
        enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly'],
        default: 'yearly',
      },
    },
    postingDate: {
      type: Date,
      default: Date.now,
    },
    applicationDeadline: Date,
    skills: [String],
    experienceLevel: {
      type: String,
      enum: ['entry', 'junior', 'mid-level', 'senior', 'executive'],
    },
    education: {
      level: String,
      field: String,
    },
    applicationProcess: {
      url: String,
      email: String,
      steps: [String],
    },
    benefits: [String],
    matchPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    applicationStatus: {
      type: String,
      enum: ['active', 'filled', 'expired', 'draft', 'paused'],
      default: 'active',
    },
    views: {
      type: Number,
      default: 0,
    },
    applicants: {
      type: Number,
      default: 0,
    },
    source: {
      name: String,
      url: String,
      externalId: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Job', JobSchema);
