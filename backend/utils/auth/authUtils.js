const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Hash password using bcrypt
 * @param {string} password - The plain text password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
  // Generate salt with 10 rounds
  const salt = await bcrypt.genSalt(10);
  // Hash password with salt
  return await bcrypt.hash(password, salt);
};

/**
 * Compare password with hash
 * @param {string} enteredPassword - The plain text password
 * @param {string} hashedPassword - The stored hashed password
 * @returns {Promise<boolean>} - True if passwords match
 */
const matchPassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

/**
 * Generate JWT token
 * @param {string} userId - User ID to include in token
 * @param {string} type - Token type (user or admin), defaults to 'user'
 * @returns {string} - JWT token
 */
const generateToken = (userId, type = 'user') => {
  return jwt.sign({ id: userId, type }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

module.exports = {
  hashPassword,
  matchPassword,
  generateToken,
};