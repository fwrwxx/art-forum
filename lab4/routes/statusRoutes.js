const express = require('express');
const router = express.Router();
const { healthCheck } = require('../middleware/performanceMiddleware');
const { logger } = require('../utils/logger');
const os = require('os');

// Статус сервера (розширений)
router.get('/', (req, res) => {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const uptime = process.uptime();
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    
    res.json({
        success: true,
        data: {
            server: {
                uptime: {
                    seconds: uptime,
                    formatted: formatUptime(uptime)
                },
                node_version: process.version,
                platform: process.platform,
                arch: process.arch,
                pid: process.pid,
                env: process.env.NODE_ENV || 'development'
            },
            memory: {
                rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
                heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
                heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
                external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`,
                system: {
                    total: `${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
                    free: `${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
                    used: `${((totalMem - freeMem) / 1024 / 1024 / 1024).toFixed(2)} GB`
                }
            },
            cpu: {
                user: `${(cpuUsage.user / 1000).toFixed(2)} ms`,
                system: `${(cpuUsage.system / 1000).toFixed(2)} ms`,
                cores: cpus.length,
                model: cpus[0]?.model || 'Unknown'
            },
            timestamp: new Date().toISOString()
        }
    });
});

// Health check (простий)
router.get('/health', healthCheck);

// Метрики в форматі для PM2
router.get('/metrics', (req, res) => {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    res.json({
        metrics: {
            heap_used: memoryUsage.heapUsed,
            heap_total: memoryUsage.heapTotal,
            rss: memoryUsage.rss,
            cpu_user: cpuUsage.user,
            cpu_system: cpuUsage.system,
            uptime: process.uptime()
        }
    });
});

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

module.exports = router;