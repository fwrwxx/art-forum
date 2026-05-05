const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { validateFile } = require('../utils/fileValidator');
const { logUploadError } = require('../utils/logger');

// Створення директорії для завантажень
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
fs.ensureDirSync(uploadDir);

// Налаштування зберігання файлів
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Створення піддиректорії за типом файлу
        let subDir = 'others';
        if (file.mimetype.startsWith('image/')) {
            subDir = 'images';
        } else if (file.mimetype === 'application/pdf') {
            subDir = 'documents';
        }
        
        const fullPath = path.join(uploadDir, subDir);
        fs.ensureDirSync(fullPath);
        cb(null, fullPath);
    },
    filename: (req, file, cb) => {
        // Генерація унікального імені: timestamp-оригінальне_ім'я
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
        cb(null, `${uniqueSuffix}-${sanitizedName}${ext}`);
    }
});

// Фільтр файлів
const fileFilter = (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/jpg,application/pdf').split(',');
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed. Allowed: ${allowedTypes.join(', ')}`), false);
    }
};

// Створення екземпляра Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
        files: 10 // максимум 10 файлів за раз
    }
});

// Middleware для одного файлу
const uploadSingle = (fieldName = 'file') => upload.single(fieldName);

// Middleware для кількох файлів
const uploadMultiple = (fieldName = 'files', maxCount = 5) => upload.array(fieldName, maxCount);

// Middleware для різних полів
const uploadFields = (fields) => upload.fields(fields);

module.exports = {
    upload,
    uploadSingle,
    uploadMultiple,
    uploadFields
};