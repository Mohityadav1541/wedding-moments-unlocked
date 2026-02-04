import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './src/models/Event.js';
import Photo from './src/models/Photo.js'; // Added Photo checking

dotenv.config();

const candidates = [
    'test',
    'admin',
    'local',
    'wedding',
    'wedding-moments',
    'wedding-moments-ai',
    'wedding-moments-unlocked',
    'ai-photo-scan',
    'photo-app',
    'production',
    'dev',
    'development',
    'cluster0',
    'Cluster0',
    'myFirstDatabase'
];

async function scan() {
    const baseUri = process.env.MONGO_URI.split('?')[0]; // Remove options
    const options = "?appName=Cluster0";

    console.log("Starting Database Scan...");

    for (const dbName of candidates) {
        // Construct URI with DB name
        // Format: mongodb+srv://user:pass@host/DBNAME?options
        // The original URI: mongodb+srv://...net/?options
        // We need to insert DB name before the /? 

        let uri;
        if (process.env.MONGO_URI.includes('.net/')) {
            uri = process.env.MONGO_URI.replace('.net/', `.net/${dbName}`);
        } else {
            uri = `${baseUri}/${dbName}${options}`;
        }

        try {
            await mongoose.disconnect();
            await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });

            const eventCount = await Event.countDocuments({});
            const photoCount = await Photo.countDocuments({});

            console.log(`Checking DB [${dbName}] -> Events: ${eventCount}, Photos: ${photoCount}`);

            if (eventCount > 0 || photoCount > 0) {
                console.log(`\n!!! FOUND IT !!!\nDatabase Name: ${dbName}\nEvents: ${eventCount}\nPhotos: ${photoCount}\n`);
                process.exit(0);
            }

        } catch (err) {
            console.log(`Failed [${dbName}]: ${err.message}`);
        }
    }

    console.log("Scan complete. No data found in candidate databases.");
    process.exit(0);
}

scan();
