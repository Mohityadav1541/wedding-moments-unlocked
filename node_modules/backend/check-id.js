import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './src/models/Event.js';

dotenv.config();

const checkID = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        // We use a try-catch for casting error if the ID is invalid format, 
        // though looking at screenshot it looks valid enough (24 hex chars)
        // Actually, in screenshot it is ...events/69831fbb95aa9b514c5e563b
        // Let's assume the ID is 69831fbb95aa9b514c5e563b. 
        // Wait, standard Mongo IDs are 24 hex chars. 
        // 69831fbb95aa9b514c5e563b is 24 chars. It seems valid.

        try {
            const event = await Event.findOne({ _id: '69831fbb95aa9b514c5e563b' });
            if (event) {
                console.log(`FOUND IT! Event: ${event.name}`);
            } else {
                console.log("Event ID 69831fbb95aa9b514c5e563b NOT found in this database.");
            }
        } catch (e) {
            console.log("Invalid ID format or not found.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
};

checkID();
