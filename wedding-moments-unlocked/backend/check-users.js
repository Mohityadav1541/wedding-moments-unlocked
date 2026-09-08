import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({}, 'email role');
        console.log("Users Found:", users);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
};

checkUsers();
