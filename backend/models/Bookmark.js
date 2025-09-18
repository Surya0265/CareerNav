const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    itemType: {
      type: String,
      enum: ['job', 'resource', 'podcast', 'article'],
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'itemModel',
      required: true,
    },
    itemModel: {
      type: String,
      required: true,
      enum: ['Job', 'LearningResource', 'Podcast', 'Article'],
    },
    savedDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
    tags: [String],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['new', 'in-progress', 'completed', 'archived'],
      default: 'new',
    },
    reminders: [
      {
        date: Date,
        message: String,
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    metadata: {
      title: String,
      description: String,
      thumbnail: String,
      url: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate bookmarks
BookmarkSchema.index({ userId: 1, itemType: 1, itemId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', BookmarkSchema);
