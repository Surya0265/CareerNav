/**
 * Password Strength Validator
 * Ensures passwords meet security requirements:
 * - Minimum 8 characters
 * - At least one number (0-9)
 * - At least one letter (a-zA-Z)
 */

const validatePasswordStrength = (password) => {
  if (!password) {
    return {
      isValid: false,
      errors: ['Password is required'],
    };
  }

  const errors = [];

  // Check minimum length
  if (password.length <= 8) {
    errors.push('Password must be greater than 8 characters');
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number (0-9)');
  }

  // Check for at least one letter
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Password must contain at least one letter (a-z, A-Z)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = { validatePasswordStrength };
