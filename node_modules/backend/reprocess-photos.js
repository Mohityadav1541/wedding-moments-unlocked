import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import connectDB from './src/config/db.js';
import Photo from './src/models/Photo.js';
import { getAllFaceDescriptors } from './src/services/externalAiService.js';

dotenv.config();
connectDB();

const reprocessPhotos = async () => {
    try {
        console.log('Reprocessing User Photos...'.cyan);

        // Find photos specifically without descriptors
        const photos = await Photo.find({
            $or: [
                { faceDescriptors: { $exists: false } },
                { faceDescriptors: { $size: 0 } }
            ]
        });

        console.log(`Found ${photos.length} photos needing AI processing.`.yellow);

        if (photos.length === 0) {
            console.log('No photos to process.');
            process.exit();
        }

        let successCount = 0;
        let failCount = 0;

        for (const photo of photos) {
            console.log(`Processing: ${photo._id} - ${photo.url}`);
            try {
                // If it's a Cloudinary URL, externalAiService should handle fetching it (we verify this logic inside service)
                // Actually, our service expects URL handling now, let's verify if getAllFaceDescriptors handles URL?
                // Step 546 showed it does handle http string by fetching.

                const descriptors = await getAllFaceDescriptors(photo.url);
                if (descriptors && descriptors.length > 0) {
                    photo.faceDescriptors = descriptors;
                    await photo.save();
                    console.log(`✅ Success: Found ${descriptors.length} faces.`.green);
                    successCount++;
                } else {
                    console.log(`⚠️ No faces found by AI.`.red);
                    failCount++;
                }
            } catch (err) {
                console.error(`❌ Error processing photo: ${err.message}`);
                failCount++;
            }
        }

        console.log(`\nProcessing Complete.`);
        console.log(`Successful: ${successCount}`.green);
        console.log(`Failed/No Faces: ${failCount}`.red);

        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

const run = async () => {
    await connectDB();
    // Wait a moment for connection to be fully ready if needed, 
    // though await connectDB should suffice if implemented correctly.
    // But connectDB in db.js handles retries recursively without resolving the promise on failure? 
    // Actually db.js:5 awaits mongoose.connect. If it succeeds, it returns. 
    // If it fails, it catches and setsTimeout for recursion. The promise resolves/rejects? 
    // The original connectDB implementation swallows the error and retries, returning undefined immediately on error path?
    // Let's just wait a safe buffer or check mongoose.connection.readyState

    let attempts = 0;
    while (mongoose.connection.readyState !== 1 && attempts < 10) {
        console.log("Waiting for DB connection...");
        await new Promise(r => setTimeout(r, 1000));
        attempts++;
    }

    if (mongoose.connection.readyState !== 1) {
        console.error("Could not connect to DB.");
        process.exit(1);
    }

    await reprocessPhotos();
};

run();
