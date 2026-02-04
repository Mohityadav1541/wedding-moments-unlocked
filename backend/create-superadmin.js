import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createSuperAdmin = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        });
        console.log('✅ Connected!');

        // Check if superadmin already exists
        const existingAdmin = await User.findOne({ email: 'mr.mohit1540@gmail.com' });
        if (existingAdmin) {
            console.log('⚠️ Superadmin already exists!');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Role: ${existingAdmin.role}`);
            process.exit(0);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('B93456a@5', salt);

        // Create superadmin
        const superadmin = new User({
            name: 'Mohit Yadav',
            email: 'mr.mohit1540@gmail.com',
            password: hashedPassword,
            role: 'superadmin',
            phone: '8619053741',
            studioName: 'Wedding Moments AI',
            photoLimit: 999999
        });

        await superadmin.save();
        console.log('✅ Superadmin created successfully!');
        console.log(`   Email: ${superadmin.email}`);
        console.log(`   Role: ${superadmin.role}`);
        console.log(`   Password: B93456a@5`);

    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

createSuperAdmin();
