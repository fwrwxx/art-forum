const { sequelize } = require('../models');

const errorLogger = async (error, req, res, next) => {
    const ErrorLog = sequelize.models.ErrorLog;
    
    if (ErrorLog) {
        await ErrorLog.create({
            error_message: error.message,
            error_stack: error.stack,
            url: req.url,
            method: req.method,
            ip: req.ip,
            user_id: req.user ? req.user.id : null
        });
    }
    
    console.error(`[ERROR] ${new Date().toISOString()}:`, error.message);
    next(error);
};

const errorHandler = (error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    
    res.status(statusCode).json({
        success: false,
        message: error.message || 'Internal server error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
};

module.exports = { errorLogger, errorHandler };