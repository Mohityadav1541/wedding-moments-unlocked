import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';

dotenv.config();

const listAdmins = async () => {
    try {
        await connectDB();
        const users = await User.find({ role: 'admin' });

        console.log(`Found ${users.length} Photographers (Admins):`);
        users.forEach(u => {
            console.log(`- Name: ${u.name} | Email: ${u.email} | ID: ${u._id}`);
        });
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

listAdmins();
