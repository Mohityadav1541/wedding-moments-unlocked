import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const checkSuperadmin = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        });
        console.log('✅ Connected!');

        // Find superadmin
        const admin = await User.findOne({ email: 'mr.mohit1540@gmail.com' });

        if (!admin) {
            console.log('❌ Superadmin NOT found in database!');
        } else {
            console.log('\n✅ Superadmin found:');
            console.log(`   Email: ${admin.email}`);
            console.log(`   Name: ${admin.name}`);
            console.log(`   Role: ${admin.role}`);
            console.log(`   Phone: ${admin.phone || 'NOT SET'}`);
            console.log(`   UPI ID: ${admin.paymentDetails?.upiId || 'NOT SET'}`);
            console.log(`   Created: ${admin.createdAt}`);
        }

    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

checkSuperadmin();
