const rateLimit = require('express-rate-limit');

// 🔐 Strict limiter for auth routes (login/register)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 10,                   // max 10 attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only count failed attempts
  message: {
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
  },
});

// 🌐 Global limiter for all API routes
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,            // 200 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please slow down.' }
});

module.exports = { loginLimiter, globalLimiter };
