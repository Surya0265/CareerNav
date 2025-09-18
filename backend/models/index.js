// Export all models from a single file for easier importing in controllers

const User = require('./User');
const Resume = require('./Resume');
const Job = require('./Job');
const LearningResource = require('./LearningResource');
const { Article, Podcast } = require('./Content');
const Bookmark = require('./Bookmark');
const Analytics = require('./Analytics');

module.exports = {
  User,
  Resume,
  Job,
  LearningResource,
  Article,
  Podcast,
  Bookmark,
  Analytics,
};
