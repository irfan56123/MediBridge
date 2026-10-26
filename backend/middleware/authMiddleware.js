const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Verify JWT and attach user to req
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id);

      if (!req.user || !req.user.isActive) {
        res.status(401);
        throw new Error('User not found or account disabled');
      }

      return next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token invalid or expired');
    }
  }

  res.status(401);
  throw new Error('Not authorized, no token provided');
});

// Restrict route to specific roles
// Usage: authorize('admin', 'doctor')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Role '${req.user ? req.user.role : 'unknown'}' is not authorized to access this route`);
    }
    next();
  };
};

module.exports = { protect, authorize };
