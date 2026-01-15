import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import User from './src/models/User.js';
import connectDB from './src/config/db.js';

dotenv.config();

connectDB();

const testLogin = async () => {
    try {
        const email = 'mr.mohit1540@gmail.com';
        const password = 'B93456a@5';

        console.log(`Testing Login for: ${email}`.cyan);

        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found in database!'.red.bold);
            process.exit(1);
        }

        console.log('User found. verifying password...'.yellow);

        const isMatch = await user.matchPassword(password);

        if (isMatch) {
            console.log('✅ LOGIN SUCCESSFUL! Credentials are correct in DB.'.green.bold);
            console.log('If it fails on Vercel, the issue is Vercel CONFIGURATION.'.white);
        } else {
            console.log('❌ PASSWORD MISMATCH! The value in DB does not match.'.red.bold);
            console.log('Re-running updateAdmin.js might be needed.'.yellow);
        }

        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

// Wait for connection
setTimeout(testLogin, 3000);
