import mongoose from 'mongoose';
import Photo from './src/models/Photo.js';
import { getAllFaceDescriptors } from './src/services/externalAiService.js';
import colors from 'colors';

// PROD URI
const MONGO_URI = "mongodb+srv://yadavboy1540_db_user:Hi14ydt2lm2uXmKl@cluster0.y8mhlfw.mongodb.net/ai-photo-scan?appName=Cluster0";

const CONCURRENCY = 5;

const reprocessPhotos = async () => {
    try {
        console.log('Connecting to Production DB...'.cyan);
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 20000
        });
        console.log('Connected!'.green);

        // Find photos specifically without descriptors
        const photos = await Photo.find({
            $or: [
                { faceDescriptors: { $exists: false } },
                { faceDescriptors: { $size: 0 } }
            ]
        }); // .limit(50); // Optional: test with small batch first? No, user wants fix now.

        console.log(`Found ${photos.length} photos needing AI processing.`.yellow);

        if (photos.length === 0) {
            console.log('No photos to process.');
            process.exit();
        }

        let successCount = 0;
        let failCount = 0;
        let processed = 0;

        // Helper for batch processing
        const processPhoto = async (photo) => {
            try {
                // console.log(`Processing [${processed}/${photos.length}]: ${photo._id}`);
                const descriptors = await getAllFaceDescriptors(photo.url);
                if (descriptors && descriptors.length > 0) {
                    photo.faceDescriptors = descriptors;
                    await photo.save();
                    process.stdout.write('✅');
                    successCount++;
                } else {
                    process.stdout.write('❌');
                    failCount++;
                }
            } catch (err) {
                process.stdout.write('E');
                failCount++;
            } finally {
                processed++;
                if (processed % 10 === 0) {
                    console.log(` [${processed}/${photos.length}]`);
                }
            }
        };

        // Chunking
        for (let i = 0; i < photos.length; i += CONCURRENCY) {
            const chunk = photos.slice(i, i + CONCURRENCY);
            await Promise.all(chunk.map(p => processPhoto(p)));
        }

        console.log(`\n\nProcessing Complete.`);
        console.log(`Successful: ${successCount}`.green);
        console.log(`Failed/No Faces: ${failCount}`.red);

        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

reprocessPhotos();
