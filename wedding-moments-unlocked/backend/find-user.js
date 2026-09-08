import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';

dotenv.config();

const findUser = async () => {
    try {
        await connectDB();
        const userName = "Roshan";
        const users = await User.find({ name: new RegExp(userName, 'i') });

        console.log(`Searching for user "${userName}"...`);
        if (users.length === 0) {
            console.log("No user found.");
        } else {
            console.log("Found Users:");
            users.forEach(u => {
                console.log(`- Name: ${u.name}`);
                console.log(`- ID: ${u._id}`);
                console.log(`- Email: ${u.email}`);
            });
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

findUser();
