import mongoose from 'mongoose';
import Photo from './src/models/Photo.js';

const MONGO_URI = "mongodb+srv://yadavboy1540_db_user:Hi14ydt2lm2uXmKl@cluster0.y8mhlfw.mongodb.net/ai-photo-scan?appName=Cluster0";

const run = async () => {
    try {
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });

        const total = await Photo.countDocuments({});
        const withDescriptors = await Photo.countDocuments({
            $expr: { $gt: [{ $size: "$faceDescriptors" }, 0] }
        });
        const withoutDescriptors = total - withDescriptors;

        console.log(`Total Photos: ${total}`);
        console.log(`With Descriptors: ${withDescriptors}`);
        console.log(`Without Descriptors: ${withoutDescriptors}`);
        console.log(`Progress: ${Math.round((withDescriptors / total) * 100)}%`);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

run();
