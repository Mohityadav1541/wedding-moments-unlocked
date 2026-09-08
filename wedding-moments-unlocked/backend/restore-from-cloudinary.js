import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import Photo from './src/models/Photo.js';
import Event from './src/models/Event.js';
import User from './src/models/User.js'; // Needed to assign event to user

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const restorePhotos = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connected to DB: ${mongoose.connection.name}`);

        // 1. Get or Create Default Event
        // We'll try to find an event, or create "Restored Event"
        let event = await Event.findOne({});

        if (!event) {
            console.log("No events found. Creating 'Restored Event'...");
            // Find a user to own it
            const user = await User.findOne({});
            if (!user) {
                console.error("Critical: No users found to assign event to. Please register a user first.");
                process.exit(1);
            }

            event = await Event.create({
                name: "Rahul weds Madhu (Restored)",
                date: new Date(),
                location: "Udaipur",
                description: "Restored photos from Cloudinary",
                user: user._id
            });
            console.log(`Created Event: ${event.name} (${event._id})`);
        } else {
            console.log(`Using existing Event: ${event.name} (${event._id})`);
        }

        // 2. Fetch Images from Cloudinary
        console.log("Fetching images from Cloudinary...");
        let nextCursor = null;
        let totalRestored = 0;

        do {
            const result = await cloudinary.api.resources({
                type: 'upload',
                prefix: 'wedding-ai/', // Assuming this is the folder used
                max_results: 100,
                next_cursor: nextCursor
            });

            console.log(`Found ${result.resources.length} images in this batch...`);

            // 3. Insert into MongoDB
            for (const img of result.resources) {
                // Check if already exists
                const exists = await Photo.findOne({ url: img.secure_url });
                if (!exists) {
                    await Photo.create({
                        event: event._id,
                        url: img.secure_url,
                        publicId: img.public_id,
                        faceDescriptors: [] // Will be scanned by AI later
                    });
                    process.stdout.write('+');
                    totalRestored++;
                } else {
                    process.stdout.write('.');
                }
            }

            nextCursor = result.next_cursor;
        } while (nextCursor);

        console.log(`\n\n🎉 Restoration Complete! Restored ${totalRestored} photos.`);
        console.log(`Next Step: Go to Dashboard -> Click 'Fix / Re-scan AI' to detect faces.`);

    } catch (error) {
        console.error("Restoration Error:", error);
    } finally {
        process.exit();
    }
};

restorePhotos();
