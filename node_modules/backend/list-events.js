
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import Event from './src/models/Event.js';

dotenv.config();

const listEvents = async () => {
    await connectDB();

    // Wait for connection
    let attempts = 0;
    while (mongoose.connection.readyState !== 1 && attempts < 10) {
        console.log("Waiting for DB...");
        await new Promise(r => setTimeout(r, 1000));
        attempts++;
    }

    try {
        const events = await Event.find({});
        console.log(`\nFound ${events.length} events:`);
        events.forEach(e => {
            console.log(`- ID: ${e._id}`);
            console.log(`  Name: ${e.name}`);
            console.log(`  Watermark: ${e.features?.watermarkText}`);
            console.log(`  Watermark Enabled: ${e.features?.watermarkEnabled}`);
            console.log('---');
        });
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

listEvents();
