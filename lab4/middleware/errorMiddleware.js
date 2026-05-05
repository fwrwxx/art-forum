const { logger } = require('../utils/logger');

/**
 * Middleware для обробки 404 помилок
 */
const notFoundMiddleware = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

/**
 * Головний middleware для обробки помилок
 */
const errorMiddleware = (err, req, res, next) => {
    // Логування помилки
    logger.error('Error occurred', {
        type: 'request_error',
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        statusCode: err.statusCode || 500,
        userAgent: req.get('user-agent')
    });
    
    // Визначення статус коду
    const statusCode = err.statusCode || 500;
    
    // Формування відповіді
    const response = {
        success: false,
        message: err.message || 'Internal Server Error',
        timestamp: new Date().toISOString()
    };
    
    // Додавання stack trace тільки в development режимі
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }
    
    res.status(statusCode).json(response);
};

/**
 * Middleware для обробки помилок Multer
 */
const multerErrorHandler = (err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        err.message = 'File too large. Maximum size is 5MB';
        err.statusCode = 400;
    } else if (err.code === 'LIMIT_FILE_COUNT') {
        err.message = 'Too many files';
        err.statusCode = 400;
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        err.message = 'Unexpected field';
        err.statusCode = 400;
    }
    next(err);
};

module.exports = {
    notFoundMiddleware,
    errorMiddleware,
    multerErrorHandler
};