import mongoose from 'mongoose';
import Photo from './src/models/Photo.js';

// Hardcoded Prod URI with explicit DB
const MONGO_URI = "mongodb+srv://yadavboy1540_db_user:Hi14ydt2lm2uXmKl@cluster0.y8mhlfw.mongodb.net/ai-photo-scan?appName=Cluster0";

const run = async () => {
    try {
        console.log("Connecting to PRODUCTION Database (ai-photo-scan)...");
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000
        });
        console.log('Connected!');

        console.log("Counting photos...");
        const total = await Photo.countDocuments({});
        console.log(`Total Photos: ${total}`);

        console.log("Clearing face descriptors...");
        const result = await Photo.updateMany(
            {},
            { $set: { faceDescriptors: [] } }
        );

        console.log(`SUCCESS: Cleared descriptors for ${result.modifiedCount} photos.`);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

run();
