const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * Middleware to protect routes that require admin authentication
 * Verifies the JWT token and attaches the admin to the request object
 */
const protectAdmin = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if token type is admin
      if (decoded.type !== 'admin') {
        return res.status(401).json({ error: 'Invalid token type for admin access' });
      }

      // Get admin from the token (exclude password)
      req.admin = await Admin.findById(decoded.id);

      if (!req.admin) {
        return res.status(401).json({ error: 'Admin not found' });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};

/**
 * Middleware to check if admin has specific permission
 */
const checkAdminPermission = (permissionKey) => {
  return (req, res, next) => {
    if (req.admin && req.admin.permissions && req.admin.permissions[permissionKey]) {
      next();
    } else {
      res.status(403).json({
        error: 'Not authorized - insufficient permissions',
      });
    }
  };
};

/**
 * Middleware to check if admin is super_admin
 */
const superAdminOnly = (req, res, next) => {
  if (req.admin && req.admin.role === 'super_admin') {
    next();
  } else {
    res.status(403).json({ error: 'This action requires super admin privileges' });
  }
};

module.exports = { protectAdmin, checkAdminPermission, superAdminOnly };
