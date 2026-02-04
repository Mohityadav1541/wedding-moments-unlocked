import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Event from './src/models/Event.js';

dotenv.config();

const createNormalEvent = async () => {
    try {
        await connectDB();

        // 1. Get User Roshan
        const user = await User.findOne({ email: 'roshan@gmail.com' });
        if (!user) {
            console.error("User roshan@gmail.com not found. Please run previous script to create user first / or I will create him now.");
            // Fallback create
            const newUser = await User.create({
                name: 'Roshan Photographer',
                email: 'roshan@gmail.com',
                password: 'password123',
                role: 'admin',
                studioName: 'Roshan Studio',
                eventQuota: 10,
                subscriptionStatus: 'active'
            });
            console.log(`User Created: ${newUser._id}`);
            return createUserEvent(newUser);
        }

        await createUserEvent(user);

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

async function createUserEvent(user) {
    // 2. Create Event "Rahul weds Madhu"
    const event = await Event.create({
        user: user._id,
        name: "Rahul weds Madhu",
        date: new Date(),
        location: "Delhi",
        price: 5000,
        pricePerPhoto: 20,
        paymentStatus: 'confirmed',
        superAdminConfirmed: true,
        features: {
            qrCode: true,
            faceRecognition: true
        }
    });

    console.log(`SUCCESS: Created Event "Rahul weds Madhu"`);
    console.log(`NEW EVENT ID: ${event._id}`);
    process.exit();
}

createNormalEvent();
