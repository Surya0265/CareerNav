const mongoose = require('mongoose');

const YouTubeRecommendationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    current_skills: [String],
    target_job: String,
    timeframe_months: Number,
    additional_context: mongoose.Schema.Types.Mixed,
    videos: [
      {
        title: String,
        url: String,
        channel: String,
        duration: String,
        reason: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('YouTubeRecommendation', YouTubeRecommendationSchema);
