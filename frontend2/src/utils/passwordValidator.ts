/**
 * Password strength validation utility for frontend
 * Mirrors backend validation rules
 */

export interface PasswordStrengthResult {
  isValid: boolean;
  errors: string[];
  score: number; // 0-3: how many requirements met
}

export const validatePasswordStrength = (password: string): PasswordStrengthResult => {
  const errors: string[] = [];
  let score = 0;

  if (!password) {
    return {
      isValid: false,
      errors: ['Password is required'],
      score: 0,
    };
  }

  // Check minimum length
  if (password.length > 8) {
    score++;
  } else {
    errors.push('Password must be greater than 8 characters');
  }

  // Check for at least one number
  if (/\d/.test(password)) {
    score++;
  } else {
    errors.push('Password must contain at least one number (0-9)');
  }

  // Check for at least one letter
  if (/[a-zA-Z]/.test(password)) {
    score++;
  } else {
    errors.push('Password must contain at least one letter (a-z, A-Z)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    score,
  };
};

export const getPasswordStrengthLabel = (score: number): string => {
  switch (score) {
    case 3:
      return 'Strong';
    case 2:
      return 'Fair';
    case 1:
      return 'Weak';
    default:
      return 'Very Weak';
  }
};

export const getPasswordStrengthColor = (score: number): string => {
  switch (score) {
    case 3:
      return 'text-green-500';
    case 2:
      return 'text-yellow-500';
    case 1:
      return 'text-orange-500';
    default:
      return 'text-red-500';
  }
};
