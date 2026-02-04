import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Event from './src/models/Event.js';
import Photo from './src/models/Photo.js';
import fs from 'fs';

dotenv.config();

const swapUserAndEvent = async () => {
    try {
        await connectDB();

        // 1. Delete Old User "roshan@gmail.com"
        const oldUser = await User.findOne({ email: 'roshan@gmail.com' });
        if (oldUser) {
            console.log(`Deleting Old User: ${oldUser.email}`);
            // Delete his events
            const events = await Event.find({ user: oldUser._id });
            for (const event of events) {
                await Photo.deleteMany({ event: event._id });
                await event.deleteOne();
            }
            await oldUser.deleteOne();
            console.log("Old User Deleted.");
        }

        // 2. Create New User "roshanlalyadav30408@gmail.com"
        console.log("Creating New User roshanlalyadav30408@gmail.com...");
        const newUser = await User.create({
            name: 'Roshan Lal Yadav',
            email: 'roshanlalyadav30408@gmail.com',
            password: 'pass', // Will be hashed
            role: 'admin',
            studioName: 'Roshan Photography',
            eventQuota: 100,
            subscriptionStatus: 'active'
        });
        console.log(`New User Created: ${newUser._id}`);

        // 3. Create Event "Rahul weds Madhu" for Tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const newEvent = await Event.create({
            user: newUser._id,
            name: "Rahul weds Madhu",
            date: tomorrow,
            location: "Delhi",
            price: 5000,
            pricePerPhoto: 20,
            paymentStatus: 'confirmed',
            superAdminConfirmed: true,
            features: {
                qrCode: true,
                faceRecognition: true,
                watermarkEnabled: true,
                watermarkText: 'Roshan Photography'
            }
        });

        const newEventId = newEvent._id.toString();
        console.log(`NEW EVENT ID: ${newEventId}`);

        // Save ID to file for reading
        fs.writeFileSync('new_event_id.txt', newEventId);

        process.exit();

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

swapUserAndEvent();
