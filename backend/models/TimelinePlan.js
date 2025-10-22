const mongoose = require('mongoose');

const PhaseSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    duration_days: Number,
    duration_weeks: Number,
    order: Number,
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
    // store detailed phase artifacts so history can display them
    skills: [String],
    projects: [String],
    milestones: [String],
  },
  { _id: false }
);

const TimelinePlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    current_skills: [String],
    target_job: String,
      // summary metadata
      phase_count: Number,
      approx_months: Number,
    timeframe_months: Number,
    additional_context: mongoose.Schema.Types.Mixed,
    mermaid_code: String,
    phases: [PhaseSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('TimelinePlan', TimelinePlanSchema);
