const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');

const getCookie = (cookieHeader, name) => {
  if (!cookieHeader) return undefined;
  return cookieHeader.split(';').map((item) => item.trim()).reduce((value, item) => {
    const separator = item.indexOf('=');
    if (separator === -1) return value;
    return decodeURIComponent(item.slice(0, separator)) === name
      ? decodeURIComponent(item.slice(separator + 1))
      : value;
  }, undefined);
};

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;
    const token = getCookie(req.headers.cookie, 'clinicocr_token') || bearerToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }
    const decoded = jwt.verify(token, config.jwtSecret);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: 'Account is inactive.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
    next(error);
  }
};

// Used only for the session-status endpoint. A missing or expired cookie is a
// normal state before login, so it should not be treated as an API failure.
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;
    const token = getCookie(req.headers.cookie, 'clinicocr_token') || bearerToken;

    if (!token) return next();

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id).select('-password');
    if (user?.status === 'ACTIVE') req.user = user;
    return next();
  } catch {
    return next();
  }
};

module.exports = authenticate;
module.exports.optional = optionalAuthenticate;
