const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100, skipFn) => {
  return rateLimit({
    windowMs,
    max,
    // Behind Render/Nginx the client IP comes from X-Forwarded-For.
    keyGenerator: (req) => req.ip || req.socket.remoteAddress || 'unknown',
    message: {
      success: false,
      message: 'Too many requests. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipFn,
  });
};

const authLimiter = createRateLimiter(15 * 60 * 1000, 100);
const apiLimiter = createRateLimiter(15 * 60 * 1000, 500, (req) => {
  return req.method === 'GET' && (req.path === '/auth/me' || req.originalUrl?.includes('/auth/me'));
});
const uploadLimiter = createRateLimiter(60 * 60 * 1000, 50);

module.exports = { createRateLimiter, authLimiter, apiLimiter, uploadLimiter };