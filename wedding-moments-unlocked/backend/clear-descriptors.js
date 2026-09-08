import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Photo from './src/models/Photo.js';

dotenv.config();

const run = async () => {
    try {
        console.log("Connecting...");
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('MongoDB Connected');

        console.log("Clearing face descriptors...");
        const result = await Photo.updateMany(
            {},
            { $set: { faceDescriptors: [] } }
        );

        console.log(`Updated ${result.modifiedCount} photos. Descriptors cleared.`);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

run();
