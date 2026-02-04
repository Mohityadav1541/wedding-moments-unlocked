import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

// Use the NEW MongoDB URI directly
const MONGO_URI = "mongodb+srv://mrmohit1540_db_user:RHVlLfCZKBj2bN5y@cluster0.assxeey.mongodb.net/?appName=Cluster0";

const recreateSuperadmin = async () => {
    try {
        console.log("Connecting to NEW MongoDB...");
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        });
        console.log('✅ Connected!');

        // Delete existing superadmin if exists
        await User.deleteOne({ email: 'mr.mohit1540@gmail.com' });
        console.log('🗑️  Deleted old superadmin (if existed)');

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('B93456a@5', salt);

        // Create fresh superadmin
        const superadmin = new User({
            name: 'Mohit Yadav',
            email: 'mr.mohit1540@gmail.com',
            password: hashedPassword,
            role: 'superadmin',
            studioName: 'Wedding Moments AI',
            photoLimit: 999999
        });

        await superadmin.save();
        console.log('\n✅ Superadmin created successfully!');
        console.log(`   Email: ${superadmin.email}`);
        console.log(`   Password: B93456a@5`);
        console.log(`   Role: ${superadmin.role}`);
        console.log('\n📝 Try logging in now!');

    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

recreateSuperadmin();
