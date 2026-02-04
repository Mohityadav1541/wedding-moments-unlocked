import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import connectDB from './src/config/db.js';
import Event from './src/models/Event.js';

dotenv.config();

const findEvent = async () => {
    try {
        await connectDB();
        const eventName = "Rahul weds Madhu";
        const events = await Event.find({ name: new RegExp(eventName, 'i') });

        if (events.length > 0) {
            const id = events[0]._id.toString();
            fs.writeFileSync('temp_id.txt', id);
            console.log(`Saved ID: ${id}`);
        } else {
            console.log("No event found.");
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

findEvent();
