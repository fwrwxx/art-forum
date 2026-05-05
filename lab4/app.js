const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { logger, httpLogger } = require('./utils/logger');
const { performanceMiddleware, memoryMonitorMiddleware } = require('./middleware/performanceMiddleware');
const { notFoundMiddleware, errorMiddleware, multerErrorHandler } = require('./middleware/errorMiddleware');

const uploadRoutes = require('./routes/uploadRoutes');
const statusRoutes = require('./routes/statusRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== Безпека ====================
app.use(helmet());
app.use(cors());

// ==================== Логування ====================
// Morgan для HTTP-запитів (з виводом у Winston)
app.use(morgan('combined', { stream: httpLogger }));
// Додаткове логування в консоль в розробці
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ==================== Обмеження запитів ====================
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 хвилин
    max: 100,
    message: {
        success: false,
        message: 'Too many requests from this IP'
    }
});
app.use(limiter);

// ==================== Парсинг тіла запиту ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== Статичні файли ====================
app.use('/uploads', express.static(process.env.UPLOAD_DIR || 'uploads'));

// ==================== Моніторинг продуктивності ====================
app.use(performanceMiddleware);
app.use(memoryMonitorMiddleware);

// ==================== Маршрути ====================
// Головна сторінка
app.get('/', (req, res) => {
    res.json({
        name: 'ArtHub Advanced Node.js Server',
        version: '1.0.0',
        description: 'Лабораторна робота №4 - Розширені можливості Node.js',
        endpoints: {
            upload: {
                single: 'POST /api/upload/single',
                multiple: 'POST /api/upload/multiple',
                list: 'GET /api/upload/list',
                delete: 'DELETE /api/upload/:filename'
            },
            status: {
                info: 'GET /api/status',
                health: 'GET /api/status/health',
                metrics: 'GET /api/status/metrics'
            }
        }
    });
});

// API маршрути
app.use('/api/upload', uploadRoutes);
app.use('/api/status', statusRoutes);

// ==================== Обробка помилок ====================
app.use(multerErrorHandler);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

// ==================== Запуск сервера ====================
const startServer = async () => {
    try {
        // Створення необхідних директорій
        const fs = require('fs-extra');
        await fs.ensureDir(process.env.UPLOAD_DIR || 'uploads');
        await fs.ensureDir(process.env.LOG_DIR || 'logs');
        
        app.listen(PORT, () => {
            logger.info(`Server started successfully`, {
                port: PORT,
                env: process.env.NODE_ENV || 'development',
                upload_dir: process.env.UPLOAD_DIR || 'uploads',
                log_dir: process.env.LOG_DIR || 'logs'
            });
            
            console.log(`
              ArtHub Advanced Node.js Server
                  Лабораторна робота №4
  Server:    http://localhost:${PORT}
  Status:    http://localhost:${PORT}/api/status
  Health:    http://localhost:${PORT}/api/status/health
  Upload:    http://localhost:${PORT}/api/upload/single
  Upload×:   http://localhost:${PORT}/api/upload/multiple
  Logs:      ./logs/combined.log, ./logs/error.log
  Uploads:   ./uploads/
            `);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Обробка неочікуваних помилок
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', { reason, promise });
});

startServer();

module.exports = app;