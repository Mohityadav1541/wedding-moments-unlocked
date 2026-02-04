import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import connectDB from './src/config/db.js';
import Photo from './src/models/Photo.js';
import { getAllFaceDescriptors } from './src/services/externalAiService.js';

dotenv.config();

const reprocessPhotos = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('AUTO-PROCESSOR STARTED (Optimized Mode)'.cyan.bold);

        // Find photos specifically without descriptors
        const photos = await Photo.find({
            $or: [
                { faceDescriptors: { $exists: false } },
                { faceDescriptors: { $size: 0 } }
            ]
        });

        console.log(`Queue Size: ${photos.length} photos.`.yellow);

        if (photos.length === 0) {
            console.log('All photos are already healthy!'.green);
            process.exit();
        }

        let successCount = 0;
        let processedCount = 0;
        const total = photos.length;

        // BATCH PROCESSING (Gentle Mode: 1 at a time to save Free Tier)
        const chunk = 1;
        for (let i = 0; i < total; i += chunk) {
            const batch = photos.slice(i, i + chunk);

            await Promise.all(batch.map(async (photo) => {
                processedCount++;
                try {
                    // OPTIMIZATION: Use smaller image
                    let aiUrl = photo.url;
                    if (aiUrl.includes('/upload/')) {
                        aiUrl = aiUrl.replace('/upload/', '/upload/w_800,q_auto,f_auto/');
                    }

                    const descriptors = await getAllFaceDescriptors(aiUrl);

                    if (descriptors && descriptors.length > 0) {
                        photo.faceDescriptors = descriptors;
                        await photo.save();
                        successCount++;
                        process.stdout.write('✅');
                    } else {
                        process.stdout.write('⚠️');
                    }
                } catch (err) {
                    process.stdout.write('❌');
                }
            }));

            // Large breather to prevent 503 Crashes
            await new Promise(r => setTimeout(r, 5000));
        }

        console.log(`\n\n🎉 AUTO-PROCESS COMPLETE!`);
        console.log(`Success: ${successCount} / ${total}`.green);
        console.log(`You can now view matching results in the app.`);

        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

reprocessPhotos();
