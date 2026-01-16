import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

// Define minimal schemas if imports fail (to be safe)
const photoSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    url: String
});
const eventSchema = new mongoose.Schema({
    name: String,
    date: Date
});

const Photo = mongoose.model('Photo', photoSchema);
const Event = mongoose.model('Event', eventSchema);

const debugCounts = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("❌ MONGO_URI is missing in .env");
            process.exit(1);
        }

        console.log("Reconnecting to DB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected.");

        const events = await Event.find({});
        console.log(`\nFound ${events.length} Events:\n`);

        for (const event of events) {
            const count = await Photo.countDocuments({ event: event._id });
            console.log(`Name: "${event.name}"`);
            console.log(`ID: ${event._id}`);
            console.log(`Photos Linked: ${count}`);
            console.log('-----------------------------------');
        }

        // Check for orphaned photos
        const totalPhotos = await Photo.countDocuments({});
        console.log(`\nTotal Photos in DB: ${totalPhotos}`);

        if (totalPhotos > 0) {
            console.log("\nInspecting first 10 photos:");
            const photos = await Photo.find({}).limit(10);
            photos.forEach(p => {
                console.log(`Photo ID: ${p._id}, Event: ${p.event}, URL: ${p.url}`);
            });
        }

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

debugCounts();
