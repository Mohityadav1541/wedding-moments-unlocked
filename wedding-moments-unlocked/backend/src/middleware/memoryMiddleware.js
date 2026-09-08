import multer from 'multer';

// Memory Storage for temporary operations (like Search)
// Keeps the file in RAM (req.file.buffer) instead of saving to disk/cloud
const storage = multer.memoryStorage();

const memoryUpload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for RAM safety
});

export default memoryUpload;
