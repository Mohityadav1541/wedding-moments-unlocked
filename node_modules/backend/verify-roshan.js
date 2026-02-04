import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Event from './src/models/Event.js';

dotenv.config();

const verifyState = async () => {
    try {
        await connectDB();

        fs.writeFileSync('verify_output.txt', "--- Checking Users ---\n");
        const users = await User.find({
            $or: [
                { email: /roshan/i },
                { name: /roshan/i }
            ]
        });

        if (users.length === 0) {
            fs.appendFileSync('verify_output.txt', "No users found matching 'roshan'.\n");
        } else {
            console.log(`Found ${users.length} users.`);
            for (const u of users) {
                const userInfo = `User: ${u.name} | ${u.email} | ID: ${u._id}\n`;
                fs.appendFileSync('verify_output.txt', userInfo);
                // Check events for this user
                const events = await Event.find({ user: u._id });
                fs.appendFileSync('verify_output.txt', `  Events (${events.length}):\n`);
                events.forEach(e => {
                    fs.appendFileSync('verify_output.txt', `  - ${e.name} (ID: ${e._id})\n`);
                });
            }
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verifyState();
