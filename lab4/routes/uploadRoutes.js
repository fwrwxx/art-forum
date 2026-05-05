const express = require('express');
const router = express.Router();
const { uploadSingle, uploadMultiple } = require('../middleware/uploadMiddleware');
const { validateFile } = require('../utils/fileValidator');
const { logger, logFileUpload, logUploadError } = require('../utils/logger');
const path = require('path');
const fs = require('fs-extra');

// Завантаження одного файлу
router.post('/single', uploadSingle('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }
        
        // Валідація файлу
        const validation = validateFile(req.file);
        
        // Логування успішного завантаження
        logFileUpload(req.file);
        
        res.json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                originalName: req.file.originalname,
                filename: req.file.filename,
                size: req.file.size,
                mimetype: req.file.mimetype,
                path: req.file.path,
                validation: validation
            }
        });
    } catch (error) {
        logUploadError(error, req.file);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Завантаження кількох файлів
router.post('/multiple', uploadMultiple('files', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }
        
        const uploadedFiles = [];
        const errors = [];
        
        req.files.forEach(file => {
            try {
                const validation = validateFile(file);
                logFileUpload(file);
                uploadedFiles.push({
                    originalName: file.originalname,
                    filename: file.filename,
                    size: file.size,
                    mimetype: file.mimetype,
                    path: file.path,
                    validation: validation
                });
            } catch (error) {
                errors.push({
                    file: file.originalname,
                    error: error.message
                });
                logUploadError(error, file);
            }
        });
        
        res.json({
            success: true,
            message: `${uploadedFiles.length} files uploaded successfully`,
            data: {
                uploaded: uploadedFiles,
                failed: errors,
                total: req.files.length
            }
        });
    } catch (error) {
        logger.error('Multiple upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading files'
        });
    }
});

// Отримання списку завантажених файлів
router.get('/list', async (req, res) => {
    try {
        const uploadDir = process.env.UPLOAD_DIR || 'uploads';
        const files = [];
        
        const scanDir = async (dir) => {
            const items = await fs.readdir(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = await fs.stat(fullPath);
                if (stat.isDirectory()) {
                    await scanDir(fullPath);
                } else {
                    files.push({
                        name: item,
                        path: fullPath,
                        size: stat.size,
                        modified: stat.mtime
                    });
                }
            }
        };
        
        if (await fs.pathExists(uploadDir)) {
            await scanDir(uploadDir);
        }
        
        res.json({
            success: true,
            count: files.length,
            data: files
        });
    } catch (error) {
        logger.error('List files error:', error);
        res.status(500).json({
            success: false,
            message: 'Error listing files'
        });
    }
});

// Видалення файлу
router.delete('/:filename', async (req, res) => {
    try {
        const uploadDir = process.env.UPLOAD_DIR || 'uploads';
        let filePath = null;
        
        // Пошук файлу в піддиректоріях
        const findFile = async (dir) => {
            const items = await fs.readdir(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = await fs.stat(fullPath);
                if (stat.isDirectory()) {
                    const found = await findFile(fullPath);
                    if (found) return found;
                } else if (item === req.params.filename) {
                    return fullPath;
                }
            }
            return null;
        };
        
        filePath = await findFile(uploadDir);
        
        if (!filePath) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }
        
        await fs.remove(filePath);
        
        logger.info('File deleted', {
            type: 'file_delete',
            filename: req.params.filename,
            path: filePath
        });
        
        res.json({
            success: true,
            message: 'File deleted successfully'
        });
    } catch (error) {
        logger.error('Delete file error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting file'
        });
    }
});

module.exports = router;