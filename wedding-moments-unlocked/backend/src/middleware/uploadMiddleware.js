import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// UNIFIED MEMORY STORAGE for all uploads
// - Event photos: handled by r2StorageService (R2 for storage, Cloudinary fallback)
// - Search selfies: handled by r2StorageService (Cloudinary, compressed for AI speed)
// Using memoryStorage for both so the controller has full control over destination.

const memStorage = multer.memoryStorage();

// Event photo uploads (up to 50MB per file)
export const upload = multer({
    storage: memStorage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
        }
    },
});

// Search selfie uploads (up to 10MB per file, multiple files)
export const searchUpload = multer({
    storage: memStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type.'));
        }
    },
});

export default upload;
