const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../utils/emailService');
const { hashPassword } = require('../utils/auth/authUtils');

const router = express.Router();

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists for security reasons
      return res.status(200).json({
        message: 'If an account exists with this email, a password reset link will be sent.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

    console.log('[PASSWORD RESET] Generated token expiry:', new Date(resetTokenExpiry).toISOString());
    console.log('[PASSWORD RESET] Time to expiry: 1 hour (60 minutes)');

    // Save token to user
    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpiry = resetTokenExpiry;
    await user.save();

    console.log('[PASSWORD RESET] Token saved to database for user:', email);

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${email}`;

    try {
      // Send email
      await sendPasswordResetEmail(email, resetToken, resetUrl);

      return res.status(200).json({
        message: 'Password reset link has been sent to your email',
        email: email,
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Clear the reset token if email failed to send
      user.passwordResetToken = undefined;
      user.passwordResetExpiry = undefined;
      await user.save();

      return res.status(500).json({
        error: 'Failed to send reset email. Please try again later.',
      });
    }
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Verify reset token
router.post('/verify-reset-token', async (req, res) => {
  try {
    const { token, email } = req.body;

    console.log('[PASSWORD RESET] Verifying token for email:', email);

    if (!token || !email) {
      return res.status(400).json({ error: 'Token and email are required' });
    }

    // Hash the token
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user
    const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpiry');
    if (!user) {
      console.log('[PASSWORD RESET] User not found:', email);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('[PASSWORD RESET] Token hash matches:', user.passwordResetToken === tokenHash);
    console.log('[PASSWORD RESET] Current time:', new Date(Date.now()).toISOString());
    console.log('[PASSWORD RESET] Token expiry:', new Date(user.passwordResetExpiry).toISOString());
    console.log('[PASSWORD RESET] Time remaining (ms):', user.passwordResetExpiry - Date.now());

    // Verify token
    if (user.passwordResetToken !== tokenHash) {
      console.log('[PASSWORD RESET] Token hash mismatch!');
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    // Check if token has expired
    const isExpired = Date.now() > user.passwordResetExpiry;
    console.log('[PASSWORD RESET] Token expired:', isExpired);
    
    if (isExpired) {
      console.log('[PASSWORD RESET] Token has expired');
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    // Token is valid
    console.log('[PASSWORD RESET] Token verified successfully');
    return res.status(200).json({
      message: 'Token is valid',
      email: email,
    });
  } catch (error) {
    console.error('[PASSWORD RESET] Error verifying reset token:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, email, newPassword, confirmPassword } = req.body;

    console.log('[PASSWORD RESET] Reset password request for:', email);

    if (!token || !email || !newPassword || !confirmPassword) {
      console.log('[PASSWORD RESET] Missing required fields');
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      console.log('[PASSWORD RESET] Passwords do not match');
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (newPassword.length < 8) {
      console.log('[PASSWORD RESET] Password too short');
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Hash the token
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user - IMPORTANT: Must use .select() to get password reset fields
    const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpiry +password');
    if (!user) {
      console.log('[PASSWORD RESET] User not found:', email);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('[PASSWORD RESET] User found, verifying token');

    // Verify token
    if (user.passwordResetToken !== tokenHash) {
      console.log('[PASSWORD RESET] Token hash mismatch - token invalid');
      console.log('[PASSWORD RESET] Expected:', user.passwordResetToken);
      console.log('[PASSWORD RESET] Got:', tokenHash);
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    // Check if token has expired
    if (Date.now() > user.passwordResetExpiry) {
      console.log('[PASSWORD RESET] Token expired during reset');
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    // Update password - HASH IT FIRST!
    console.log('[PASSWORD RESET] Token verified, updating password');
    const hashedPassword = await hashPassword(newPassword);
    console.log('[PASSWORD RESET] Password hashed successfully');
    
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();

    console.log('[PASSWORD RESET] Password updated successfully for:', email);
    return res.status(200).json({
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('[PASSWORD RESET] Error resetting password:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
