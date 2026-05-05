const winston = require('winston');
const path = require('path');
const fs = require('fs-extra');

// Створення директорії для логів, якщо не існує
const logDir = process.env.LOG_DIR || 'logs';
fs.ensureDirSync(logDir);

// Формат для логів
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Формат для консолі (більш читабельний)
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let metaStr = Object.keys(meta).length ? `\n  ${JSON.stringify(meta, null, 2)}` : '';
        return `${timestamp} ${level}: ${message}${metaStr}`;
    })
);

// Створення логера
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: logFormat,
    transports: [
        // Запис усіх логів у файл
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        }),
        // Запис помилок окремо
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 5242880,
            maxFiles: 5,
            tailable: true
        }),
        // Виведення в консоль
        new winston.transports.Console({
            format: consoleFormat,
            level: 'debug'
        })
    ]
});

// Функція для логування HTTP-запитів (для використання з Morgan)
const httpLogger = {
    write: (message) => {
        logger.info(message.trim());
    }
};

// Функція для логування продуктивності
const logPerformance = (req, res, duration) => {
    logger.info('Performance metric', {
        type: 'request_duration',
        method: req.method,
        url: req.url,
        duration_ms: duration,
        status: res.statusCode,
        user_agent: req.get('user-agent'),
        ip: req.ip
    });
};

// Функція для логування завантаження файлів
const logFileUpload = (file, userId = null) => {
    logger.info('File uploaded', {
        type: 'file_upload',
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        destination: file.destination,
        saved_name: file.filename,
        user_id: userId
    });
};

// Функція для логування помилок завантаження
const logUploadError = (error, fileInfo = null) => {
    logger.error('File upload error', {
        type: 'upload_error',
        error: error.message,
        file: fileInfo
    });
};

module.exports = {
    logger,
    httpLogger,
    logPerformance,
    logFileUpload,
    logUploadError
};