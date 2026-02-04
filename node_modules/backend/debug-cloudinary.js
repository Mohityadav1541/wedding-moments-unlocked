import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const listImages = async () => {
    try {
        console.log("Connecting to Cloudinary...");
        console.log(`Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);

        // Get all resources
        const result = await cloudinary.api.resources({
            type: 'upload',
            max_results: 50
        });

        console.log(`\nFound ${result.resources.length} images.`);

        result.resources.forEach(img => {
            console.log(`- [${img.public_id}] ${img.secure_url}`);
        });

    } catch (error) {
        console.error("Cloudinary Error:", error);
    }
};

listImages();
