const { logPerformance } = require('../utils/logger');

/**
 * Middleware для вимірювання часу відповіді сервера
 */
const performanceMiddleware = (req, res, next) => {
    const start = Date.now();
    let finished = false;
    
    // Функція для завершення вимірювання
    const finishMeasurement = () => {
        if (finished) return;
        finished = true;
        
        const duration = Date.now() - start;
        
        // Логування продуктивності
        logPerformance(req, res, duration);
        
        // Додавання заголовка з часом виконання (тільки якщо заголовки ще не відправлені)
        if (!res.headersSent) {
            res.setHeader('X-Response-Time', `${duration}ms`);
        }
    };
    
    // Перехоплюємо res.json
    const originalJson = res.json;
    res.json = function(data) {
        finishMeasurement();
        return originalJson.call(this, data);
    };
    
    // Перехоплюємо res.send
    const originalSend = res.send;
    res.send = function(data) {
        finishMeasurement();
        return originalSend.call(this, data);
    };
    
    // Для випадків, коли не викликаються json/send
    res.once('finish', finishMeasurement);
    
    next();
};

/**
 * Middleware для моніторингу використання пам'яті
 */
const memoryMonitorMiddleware = (req, res, next) => {
    const memoryUsage = process.memoryUsage();
    
    // Попередження при високому використанні пам'яті
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
    const rssMB = memoryUsage.rss / 1024 / 1024;
    
    if (heapUsedMB > 500) { // > 500MB
        console.warn(`High memory usage: heap=${heapUsedMB.toFixed(2)}MB, rss=${rssMB.toFixed(2)}MB`);
    }
    
    next();
};

/**
 * Health check endpoint
 */
const healthCheck = (req, res) => {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const uptime = process.uptime();
    
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: {
            seconds: uptime,
            formatted: formatUptime(uptime)
        },
        memory: {
            rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
            heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
            heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
            external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`
        },
        cpu: {
            user: `${(cpuUsage.user / 1000).toFixed(2)} ms`,
            system: `${(cpuUsage.system / 1000).toFixed(2)} ms`
        },
        environment: process.env.NODE_ENV || 'development'
    });
};

/**
 * Форматування uptime
 */
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days}д`);
    if (hours > 0) parts.push(`${hours}г`);
    if (minutes > 0) parts.push(`${minutes}хв`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}с`);
    
    return parts.join(' ');
}

module.exports = {
    performanceMiddleware,
    memoryMonitorMiddleware,
    healthCheck
};