const path = require('path');
const mime = require('mime-types');

// Дозволені типи файлів
const allowedMimeTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/jpg,application/pdf').split(',');
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB

/**
 * Перевірка типу файлу
 */
const validateFileType = (file) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new Error(`File type not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`);
    }
    return true;
};

/**
 * Перевірка розміру файлу
 */
const validateFileSize = (file) => {
    if (file.size > maxFileSize) {
        throw new Error(`File too large. Maximum size: ${maxFileSize / 1024 / 1024}MB`);
    }
    return true;
};

/**
 * Отримання розширення файлу
 */
const getFileExtension = (filename) => {
    return path.extname(filename).toLowerCase();
};

/**
 * Перевірка чи є зображенням
 */
const isImage = (file) => {
    return file.mimetype.startsWith('image/');
};

/**
 * Перевірка чи є PDF
 */
const isPDF = (file) => {
    return file.mimetype === 'application/pdf';
};

/**
 * Валідація перед збереженням
 */
const validateFile = (file) => {
    validateFileType(file);
    validateFileSize(file);
    return {
        isValid: true,
        isImage: isImage(file),
        isPDF: isPDF(file),
        extension: getFileExtension(file.originalname),
        size: file.size,
        mimetype: file.mimetype
    };
};

module.exports = {
    validateFile,
    validateFileType,
    validateFileSize,
    getFileExtension,
    isImage,
    isPDF,
    allowedMimeTypes,
    maxFileSize
};