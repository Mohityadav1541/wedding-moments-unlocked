import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import User from './src/models/User.js';
import connectDB from './src/config/db.js';

dotenv.config();

connectDB();

const updateAdmin = async () => {
    try {
        const email = 'superadmin@example.com'; // Old email
        const newEmail = 'mr.mohit1540@gmail.com';
        const newPassword = 'B93456a@5';
        const newPhone = '63671 39566';
        const newWhatsapp = 'https://wa.me/6367139566';
        const newName = 'DUO MXG';

        const user = await User.findOne({ email });

        if (user) {
            user.name = newName;
            user.email = newEmail;
            user.password = newPassword; // Will be hashed by pre-save hook
            user.phone = newPhone;
            user.whatsapp = newWhatsapp;

            await user.save();
            console.log('Super Admin Updated Successfully!'.green.inverse);
        } else {
            console.log('Old Super Admin not found, checking for new email...'.yellow);
            const newUser = await User.findOne({ email: newEmail });
            if (newUser) {
                console.log('Super Admin already exists with new email.'.blue);
                // Update fields just in case
                newUser.name = newName;
                newUser.password = newPassword;
                newUser.phone = newPhone;
                newUser.whatsapp = newWhatsapp;
                await newUser.save();
                console.log('Super Admin details refreshed!'.green.inverse);
            } else {
                console.log('Creating new Super Admin...'.blue);
                await User.create({
                    name: newName,
                    email: newEmail,
                    password: newPassword,
                    role: 'superadmin',
                    phone: newPhone,
                    whatsapp: newWhatsapp
                });
                console.log('Super Admin Created!'.green.inverse);
            }
        }

        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

updateAdmin();
