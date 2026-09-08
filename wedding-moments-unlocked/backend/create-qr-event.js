import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Event from './src/models/Event.js';

dotenv.config();

const createData = async () => {
    try {
        await connectDB();

        // 1. Create User "Roshan"
        console.log("Creating User Roshan...");
        let user = await User.findOne({ email: 'roshan@gmail.com' });

        if (!user) {
            user = await User.create({
                name: 'Roshan Photographer',
                email: 'roshan@gmail.com',
                password: 'password123', // Will be hashed by pre-save hook
                role: 'admin',
                studioName: 'Roshan Studio',
                eventQuota: 10,
                subscriptionStatus: 'active'
            });
            console.log(`User Created: ${user.name} (${user._id})`);
        } else {
            console.log(`User already exists: ${user.name} (${user._id})`);
        }

        // 2. Create Event "Rahul weds Madhu" with SPECIFIC ID
        const targetId = '67a11695e6a42244c2a844f930b6'; // From QR Code

        // Check if event with this ID already exists
        let event = await Event.findById(targetId);

        if (event) {
            console.log("Event with this ID already exists. Updating details...");
            event.name = "Rahul weds Madhu";
            event.user = user._id;
            event.date = new Date();
            event.paymentStatus = 'confirmed'; // Activate it
            event.superAdminConfirmed = true;
            event.features.watermarkText = 'Sanwaliya Photo Studio';
            event.markModified('features');
            await event.save();
            console.log("Event updated.");
        } else {
            console.log("Creating Event with specific ID...");
            event = new Event({
                _id: targetId,
                name: "Rahul weds Madhu",
                user: user._id,
                date: new Date(),
                location: "Delhi",
                price: 5000,
                pricePerPhoto: 20,
                paymentStatus: 'confirmed',
                superAdminConfirmed: true,
                features: {
                    qrCode: true,
                    faceRecognition: true,
                    watermarkText: 'Sanwaliya Photo Studio'
                }
            });
            await event.save();
            console.log(`Event Created: ${event.name} (${event._id})`);
        }

        process.exit();

    } catch (error) {
        console.error("Error creating data:", error);
        process.exit(1);
    }
};

createData();
