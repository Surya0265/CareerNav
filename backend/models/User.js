const mongoose = require('mongoose');
const { validatePasswordStrength } = require('../utils/passwordValidator');

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
      minlength: [9, 'Password must be greater than 8 characters'],
      validate: {
        validator: function(password) {
          // Only validate on initial password creation, not on other updates
          if (this.isModified('password') || this.isNew) {
            const validation = validatePasswordStrength(password);
            return validation.isValid;
          }
          return true;
        },
        message: function() {
          const validation = validatePasswordStrength(this.password);
          return validation.errors.join(', ');
        }
      },
      select: false, // Don't return password in query results
    },
    passwordResetToken: {
      type: String,
      select: false, // Don't return token in query results
    },
    passwordResetExpiry: {
      type: Date,
      select: false, // Don't return expiry in query results
    },
    // Email verification fields
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: {
      type: String,
      select: false
    },
    verificationExpiry: {
      type: Date,
      select: false
    },
    skills: [
      {
        name: { type: String, required: true },
        level: { type: String },
        verified: { type: Boolean, default: false },
        category: { type: String }
      }
    ],
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
