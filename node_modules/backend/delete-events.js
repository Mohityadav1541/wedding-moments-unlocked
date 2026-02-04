import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import connectDB from './src/config/db.js';
import Event from './src/models/Event.js';
import Photo from './src/models/Photo.js';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const eventNamesToDelete = [
    "Pooja weds Sumit",
    "Mohit weds Seema"
];

const deleteEvents = async () => {
    try {
        await connectDB();

        console.log("Connected to DB. Finding events...");

        for (const eventName of eventNamesToDelete) {
            // Find events with this name (could be multiple if testing)
            // Using regex for case-insensitive partial match if needed, or exact match
            const events = await Event.find({ name: new RegExp(eventName, 'i') });

            if (events.length === 0) {
                console.log(`No events found with name: "${eventName}"`);
                continue;
            }

            console.log(`Found ${events.length} event(s) for "${eventName}"`);

            for (const event of events) {
                console.log(`Processing Event: ${event.name} (ID: ${event._id})`);

                // 1. Find Photos
                const photos = await Photo.find({ event: event._id });
                console.log(`  - Found ${photos.length} photos.`);

                // 2. Delete from Cloudinary
                let deletedCount = 0;
                for (const photo of photos) {
                    if (photo.url && photo.url.includes('cloudinary')) {
                        try {
                            const urlParts = photo.url.split('/');
                            const filenameWithExt = urlParts[urlParts.length - 1];
                            const folderName = urlParts[urlParts.length - 2];
                            const publicId = `${folderName}/${filenameWithExt.split('.')[0]}`;

                            // console.log(`    Deleting Cloudinary ID: ${publicId}`);
                            await cloudinary.uploader.destroy(publicId);
                            deletedCount++;
                        } catch (err) {
                            console.error(`    Failed to delete photo ${photo._id} from Cloudinary:`, err.message);
                        }
                    }
                }
                console.log(`  - Deleted ${deletedCount} images from Cloudinary.`);

                // 3. Delete Photos from DB
                await Photo.deleteMany({ event: event._id });
                console.log(`  - Deleted photos from Database.`);

                // 4. Delete Event
                await event.deleteOne();
                console.log(`  - Event deleted successfully.\n`);
            }
        }

        console.log("All tasks completed.");
        process.exit();

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

deleteEvents();
