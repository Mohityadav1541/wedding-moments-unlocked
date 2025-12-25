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
    params: {
        folder: 'wedding-ai',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        // transformation: [{ width: 1000, crop: "limit" }] // Optional optimization
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
});

export default upload;
