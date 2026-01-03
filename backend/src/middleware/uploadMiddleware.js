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

        // Auto-Compression & Optimization for Mobile
        // Resizes huge DSLR photos to max 2500px width (approx 4K quality, perfect for mobile)
        // 'limit' ensures small images are NOT scaled up
        // 'q_auto' automatically adjusts quality to human-eye perception (saves ~60% size)
        // 'f_auto' serves WebP/AVIF to compatible devices
        transformation.push({
            width: 2500,
            crop: "limit",
            quality: "auto",
            fetch_format: "auto"
        });

        return {
            folder: 'wedding-ai',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            public_id: `${file.fieldname}-${Date.now()}`,
            transformation: transformation
        };
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
});

export default upload;
