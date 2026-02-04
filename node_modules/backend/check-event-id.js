import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import Event from './src/models/Event.js';

dotenv.config();

const checkEvent = async () => {
    try {
        await connectDB();
        const targetId = '69820f061eece4897d31f57f';
        console.log(`Checking for Event ID: ${targetId}`);

        // Need to try/catch because if ID format is somehow wrong for this mongoose version (unlikely for 24 chars)
        let event = null;
        if (mongoose.Types.ObjectId.isValid(targetId)) {
            event = await Event.findById(targetId);
        } else {
            console.log("Invalid ObjectId format.");
        }

        if (event) {
            console.log(`FOUND EVENT: ${event.name}`);
            console.log(`User ID: ${event.user}`);
        } else {
            console.log("Event NOT found.");
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkEvent();
