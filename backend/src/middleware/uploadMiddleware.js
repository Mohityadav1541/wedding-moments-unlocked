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
        if (file.fieldname === 'image') {
            const studioName = req.user?.studioName || 'Wedding Moments AI';

            if (studioName && req.body.watermark !== 'false') {
                transformation.push({
                    overlay: {
                        font_family: "Arial",
                        font_size: 80,
                        text: studioName,
                        font_weight: "bold"
                    },
                    color: "#FFFFFF",
                    opacity: 50,
                    gravity: "south_east",
                    x: 20,
                    y: 20
                });
            }
        }

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
