const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    avatar: {
      type: String,
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false, // Don't return password in query results
    },
    preferences: {
      industries: [String],
      jobInterests: [String],
      locationPreferences: [String],
    },
    accountSettings: {
      notifications: {
        email: { type: Boolean, default: true },
        jobAlerts: { type: Boolean, default: true },
        resourceUpdates: { type: Boolean, default: true },
      },
      privacy: {
        profileVisibility: { type: String, default: 'public' },
        resumeVisibility: { type: String, default: 'private' },
      },
      theme: { type: String, default: 'light' },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', UserSchema);
