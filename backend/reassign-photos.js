import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const photoSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    url: String
});
const eventSchema = new mongoose.Schema({
    name: String
});

const Photo = mongoose.model('Photo', photoSchema);
const Event = mongoose.model('Event', eventSchema);

const reassign = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected.");

        // Target Event ID (from debug-db.js) - "manoj weds jyoti"
        const targetEventId = '696a42244c2a844f930b695e';

        console.log(`Reassigning all photos to Event ID: ${targetEventId}`);

        const result = await Photo.updateMany(
            {}, // Match ALL photos (be careful if there are multiple real events, but for this user likely just one main one)
            { $set: { event: targetEventId } }
        );

        console.log(`✅ Updated ${result.modifiedCount} photos.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

reassign();
