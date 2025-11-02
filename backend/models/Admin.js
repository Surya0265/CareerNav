const mongoose = require('mongoose');
const { validatePasswordStrength } = require('../utils/passwordValidator');

const AdminSchema = new mongoose.Schema(
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
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [9, 'Password must be greater than 8 characters'],
      validate: {
        validator: function(password) {
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
      select: false,
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
    verificationTokenExpiry: {
      type: Date,
      select: false
    },
    // Password reset fields
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpiry: {
      type: Date,
      select: false,
    },
    // Admin role and permissions
    role: {
      type: String,
      enum: ['super_admin', 'admin'],
      default: 'admin'
    },
    permissions: {
      viewLogs: { type: Boolean, default: true },
      manageLogs: { type: Boolean, default: true },
      manageAdmins: { type: Boolean, default: false },
      manageUsers: { type: Boolean, default: false },
    },
    // Admin specific fields
    lastLogin: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active'
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for email
AdminSchema.index({ email: 1 });
AdminSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Admin', AdminSchema);
