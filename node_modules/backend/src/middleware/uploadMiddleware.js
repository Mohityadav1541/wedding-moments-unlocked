import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Production-ready Cloudinary Storage
// (Local storage does not work on Render/Vercel)

if (!cloudinary.config().cloud_name) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let transformation = [];

        // Only watermark 'image' uploads (Event Photos), skip 'screenshot' (Payment Proofs)
        // We now rely on DYNAMIC watermarking in photoController.js to avoid double watermarking
        // and to keep originals clean.
        if (file.fieldname === 'image') {
            // No static watermark
        }

        // Mobile-Optimized Compression (97% users on mobile)
        // Quality 70% = ~250KB per photo = 50 events possible on free plan
        // 1080px = perfect for mobile Full HD screens
        transformation.push({
            width: 1080,
            crop: "limit",
            quality: "70",         // Optimized for mobile downloads
            fetch_format: "auto"   // WebP/AVIF when supported
        });

        return {
            folder: 'wedding-ai',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            public_id: `${file.fieldname}-${Date.now()}`,
            transformation: transformation
        };
    },
});

const searchStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'wedding-ai-search',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        public_id: (req, file) => `search-${Date.now()}`,
        // No transformations - keep exactly as client sent (high quality, pre-compressed)
    },
});

export const searchUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
});

export const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
});

export default upload;
