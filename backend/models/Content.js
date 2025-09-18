const mongoose = require('mongoose');

// Article Schema
const ArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Please add content'],
    },
    author: {
      name: String,
      bio: String,
      avatar: String,
      website: String,
    },
    source: {
      name: String,
      url: String,
      logo: String,
    },
    tags: [String],
    categories: [String],
    image: {
      url: String,
      alt: String,
      caption: String,
    },
    publishedDate: {
      type: Date,
      default: Date.now,
    },
    readTime: {
      value: Number,
      unit: {
        type: String,
        default: 'minutes',
      },
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    summary: String,
    relatedSkills: [String],
    relatedJobs: [String],
    seoMetadata: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Podcast Schema
const PodcastSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    host: {
      name: String,
      bio: String,
      avatar: String,
      website: String,
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Please add duration'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    audioUrl: {
      type: String,
      required: [true, 'Please add an audio URL'],
    },
    image: {
      url: String,
      alt: String,
    },
    categories: [String],
    tags: [String],
    listeners: {
      type: Number,
      default: 0,
    },
    publishedDate: {
      type: Date,
      default: Date.now,
    },
    episodeNumber: Number,
    season: Number,
    seriesName: String,
    transcriptUrl: String,
    guests: [
      {
        name: String,
        title: String,
        company: String,
        bio: String,
      },
    ],
    highlights: [
      {
        title: String,
        timestamp: Number, // in seconds
        description: String,
      },
    ],
    topics: [String],
    relatedSkills: [String],
    relatedJobs: [String],
    platforms: [
      {
        name: String,
        url: String,
      },
    ],
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
  },
  {
    timestamps: true,
  }
);

const Article = mongoose.model('Article', ArticleSchema);
const Podcast = mongoose.model('Podcast', PodcastSchema);

module.exports = {
  Article,
  Podcast,
};
