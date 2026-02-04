import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

const MONGO_URI = "mongodb+srv://mrmohit1540_db_user:RHVlLfCZKBj2bN5y@cluster0.assxeey.mongodb.net/wedding-ai?retryWrites=true&w=majority&appName=Cluster0";

const createSuperadminCorrectly = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        });
        console.log('✅ Connected!');

        // Delete existing
        await User.deleteOne({ email: 'mr.mohit1540@gmail.com' });
        console.log('🗑️  Deleted old superadmin');

        // Create with plain password - let the pre-save hook hash it
        const superadmin = new User({
            name: 'Mohit Yadav',
            email: 'mr.mohit1540@gmail.com',
            password: 'B93456a@5', // Plain password - will be hashed by pre-save hook
            role: 'superadmin',
            studioName: 'Wedding Moments AI',
            photoLimit: 999999
        });

        await superadmin.save();
        console.log('\n✅ Superadmin created with auto-hashed password!');
        console.log(`   Email: mr.mohit1540@gmail.com`);
        console.log(`   Password: B93456a@5`);

    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

createSuperadminCorrectly();
