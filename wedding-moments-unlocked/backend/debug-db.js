import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Photo from './src/models/Photo.js';

dotenv.config();

const run = async () => {
    try {
        console.log("Connecting...");
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('MongoDB Connected');

        // Just get one doc to start
        console.log("Fetching one photo...");
        const photo = await Photo.findOne({
            faceDescriptors: { $exists: true, $not: { $size: 0 } }
        }).select('faceDescriptors url');

        if (!photo) {
            console.log("No photos with descriptors found!");
        } else {
            console.log(`\nPhoto ID: ${photo._id}`);
            console.log(`Descriptor Count: ${photo.faceDescriptors.length}`);
            const desc = photo.faceDescriptors[0];
            console.log(`First 5 dims: ${desc.slice(0, 5).join(', ')}`);

            // Check if values are zero
            const isZero = desc.every(n => n === 0);
            if (isZero) console.log("WARNING: VECTOR IS ALL ZEROS");

            // Check if values are near identical
            const firstVal = desc[0];
            const isUniform = desc.every(n => Math.abs(n - firstVal) < 0.0001);
            if (isUniform) console.log("WARNING: VECTOR IS UNIFORM (Garbage)");
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

run();
