import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';

dotenv.config();

const checkUser = async () => {
    try {
        await connectDB();
        const email = "roshanlalyadav30408@gmail.com";
        const user = await User.findOne({ email });

        if (user) {
            console.log(`User Found: ${user.name} (${user._id})`);
        } else {
            console.log("User NOT found.");
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkUser();
