const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileInfo: {
      path: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: ['pdf', 'docx', 'doc'],
        required: true,
      },
      originalName: String,
      size: Number,
      uploadDate: {
        type: Date,
        default: Date.now,
      },
    },
    personalInfo: {
      name: String,
      email: String,
      phone: String,
      location: String,
      linkedIn: String,
      portfolio: String,
    },
    workExperience: [
      {
        title: String,
        company: String,
        location: String,
        startDate: Date,
        endDate: Date,
        current: {
          type: Boolean,
          default: false,
        },
        description: String,
        achievements: [String],
        technologies: [String],
      },
    ],
    education: [
      {
        degree: String,
        field: String,
        school: String,
        location: String,
        startYear: Number,
        endYear: Number,
        gpa: Number,
        achievements: [String],
      },
    ],
    skills: [
      {
        name: String,
        category: String,
        proficiency: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        },
      },
    ],
    certifications: [
      {
        name: String,
        issuer: String,
        issueDate: Date,
        expiryDate: Date,
        credentialId: String,
      },
    ],
    analysis: {
      overallScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      categoryScores: {
        relevance: { type: Number, min: 0, max: 100 },
        readability: { type: Number, min: 0, max: 100 },
        completeness: { type: Number, min: 0, max: 100 },
        keywords: { type: Number, min: 0, max: 100 },
      },
      skillGapAnalysis: {
        missingSkills: [String],
        improvementAreas: [String],
        recommendedSkills: [
          {
            skill: String,
            importance: { type: Number, min: 0, max: 100 },
            reason: String,
          },
        ],
      },
      aiSuggestions: [
        {
          section: String,
          suggestion: String,
          impact: String,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Resume', ResumeSchema);
