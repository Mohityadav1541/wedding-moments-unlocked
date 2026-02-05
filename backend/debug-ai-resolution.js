import { getAllFaceDescriptors } from './src/services/externalAiService.js';
import dotenv from 'dotenv';
dotenv.config();

const testImage = "https://res.cloudinary.com/dwjzce0ny/image/upload/v1770202801/wedding-ai/image-1770202799862.jpg";

const runTest = async () => {
    console.log("Testing AI Service with 1600px logic...");
    try {
        const descriptors = await getAllFaceDescriptors(testImage);
        console.log(`Success! Found ${descriptors.length} faces.`);
    } catch (error) {
        console.error("Failed:", error);
    }
};

runTest();
