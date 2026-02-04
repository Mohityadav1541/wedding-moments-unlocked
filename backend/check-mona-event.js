import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Photo from './src/models/Photo.js';
import Event from './src/models/Event.js';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
    } catch (error) {
        process.exit(1);
    }
};

const checkSpecificEvent = async () => {
    await connectDB();

    // Find the event by name part
    const event = await Event.findOne({ name: /Mona/i });

    if (!event) {
        console.log("Could not find event matching 'Mona'");
        process.exit();
    }

    console.log(`Check for Event: ${event.name} (${event._id})`);

    const total = await Photo.countDocuments({ event: event._id });
    const pending = await Photo.countDocuments({
        event: event._id,
        $or: [
            { faceDescriptors: { $size: 0 } },
            { faceDescriptors: { $exists: false } }
        ]
    });

    console.log(`Total Photos: ${total}`);
    console.log(`Pending AI: ${pending}`);

    process.exit();
};

checkSpecificEvent();
