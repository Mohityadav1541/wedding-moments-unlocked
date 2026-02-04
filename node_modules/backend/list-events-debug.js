
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import Event from './src/models/Event.js';
import fs from 'fs';

dotenv.config();

const listEvents = async () => {
    try {
        await connectDB();
        const events = await Event.find({}, 'name _id');

        let output = "EXISTING EVENTS:\n";
        events.forEach(e => {
            output += `NAME: "${e.name}"   ID: ${e._id}\n`;
        });

        fs.writeFileSync('events_list.txt', output);
        console.log("List saved to events_list.txt");
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

listEvents();
