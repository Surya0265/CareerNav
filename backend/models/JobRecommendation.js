const mongoose = require('mongoose');

const JobRecommendationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    skills: [String],
    city: String,
    country: String,
    source: {
      type: String,
      enum: ['uploaded', 'existing', 'legacy', 'manual'],
      default: 'existing',
    },
    jobs: [
      {
        title: String,
        company: String,
        location: String,
        salary: String,
        applyLink: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('JobRecommendation', JobRecommendationSchema);
