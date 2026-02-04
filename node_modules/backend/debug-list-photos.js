import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Photo from './src/models/Photo.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('MongoDB Connected');

        const count = await Photo.countDocuments({});
        console.log(`Total Photos in DB: ${count}`);

        const photos = await Photo.find({}).limit(5).lean();

        photos.forEach((p, i) => {
            console.log(`\n[${i}] ID: ${p._id}`);
            console.log(`    URL: ${p.url}`);
            console.log(`    Descriptors Type: ${typeof p.faceDescriptors}`);
            console.log(`    Is Array? ${Array.isArray(p.faceDescriptors)}`);
            if (Array.isArray(p.faceDescriptors)) {
                console.log(`    Length: ${p.faceDescriptors.length}`);
                if (p.faceDescriptors.length > 0) {
                    console.log(`    First Item Type: ${typeof p.faceDescriptors[0]}`);
                    // console.log(`    First Item: ${JSON.stringify(p.faceDescriptors[0])}`);
                }
            }
        });

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

run();
