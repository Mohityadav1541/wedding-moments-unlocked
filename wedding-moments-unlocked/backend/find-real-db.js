import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Photo from './src/models/Photo.js';

dotenv.config();

const DB_NAMES = [
    'test',
    'admin',
    'local',
    'wedding',
    'wedding-moments',
    'wedding_moments',
    'wedding-moments-unlocked',
    'production',
    'dev',
    'development'
];

const run = async () => {
    const baseUri = process.env.MONGO_URI.split('?')[0]; // Remove query params
    const options = { serverSelectionTimeoutMS: 3000 };

    for (const dbName of DB_NAMES) {
        try {
            // Construct URI with DB name
            // handle trailing slash
            let uri = baseUri.endsWith('/') ? baseUri + dbName : baseUri + '/' + dbName;
            uri += "?appName=Cluster0"; // Add params back if needed

            console.log(`Checking DB: ${dbName}...`);
            await mongoose.connect(uri, options);

            const count = await Photo.countDocuments({});
            console.log(`   -> Photos Found: ${count}`);

            if (count > 0) {
                console.log(`   !!! FOUND IT !!! Database is: "${dbName}"`);

                // Prompt to clear
                console.log("   Clearing descriptors now...");
                const res = await Photo.updateMany({}, { $set: { faceDescriptors: [] } });
                console.log(`   Cleared ${res.modifiedCount} photos.`);
                process.exit(0);
            }

            await mongoose.disconnect();

        } catch (err) {
            console.log(`   -> Error connecting to ${dbName}: ${err.message}`);
        }
    }
    console.log("No photos found in common DB names.");
};

run();
