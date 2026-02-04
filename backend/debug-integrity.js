import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Photo from './src/models/Photo.js';
import { getCosineSimilarity } from './src/services/externalAiService.js';

dotenv.config();

// Explicitly handle promise rejection
process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, 'reason:', reason);
    process.exit(1);
});

const run = async () => {
    console.log("STARTING SCRIPT...");
    try {
        console.log("URI:", process.env.MONGO_URI ? "Found" : "Missing");

        console.log("Connecting...");
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('MongoDB Connected!');

        const photos = await Photo.find({
            faceDescriptors: { $exists: true, $not: { $size: 0 } }
        }).select('faceDescriptors _id').limit(5).lean();

        console.log(`Fetched ${photos.length} photos.`);

        if (photos.length < 2) {
            console.log("Not enough photos.");
            process.exit(0);
        }

        const p1 = photos[0];
        const p2 = photos[1];

        const d1 = p1.faceDescriptors[0];
        const d2 = p2.faceDescriptors[0];

        console.log(`D1 (5 dims): ${d1.slice(0, 5)}`);
        console.log(`D2 (5 dims): ${d2.slice(0, 5)}`);

        const sim = getCosineSimilarity(d1, d2);
        console.log(`SIMILARITY: ${sim}`);

    } catch (err) {
        console.error("ERROR:", err);
    } finally {
        console.log("Closing connection...");
        await mongoose.disconnect();
        console.log("Done.");
        process.exit(0);
    }
};

run();
