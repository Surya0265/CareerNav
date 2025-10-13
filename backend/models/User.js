const mongoose = require('mongoose');

console.log('Defining User model schema');

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
    skills: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ technical: [], soft: [] })
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

// Add pre-save hook for logging
UserSchema.pre('save', function(next) {
  console.log('Pre-save hook triggered for user:', this.email);
  next();
});

// Add post-save hook for logging
UserSchema.post('save', function(doc) {
  console.log('User successfully saved to database:', doc.email);
});

const User = mongoose.model('User', UserSchema);
console.log('User model registered with Mongoose');

module.exports = User;
