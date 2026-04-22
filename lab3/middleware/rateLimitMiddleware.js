const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 хвилин
    max: 5, // максимум 5 спроб
    message: {
        success: false,
        message: 'Too many login attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 хвилина
    max: 100,
    message: {
        success: false,
        message: 'Too many requests. Please try again later.'
    }
});

module.exports = { loginLimiter, apiLimiter };