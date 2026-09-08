import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Event from './src/models/Event.js';
import Photo from './src/models/Photo.js';

dotenv.config();

const run = async () => {
    try {
        console.log("Connecting to new MongoDB cluster...");
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        });
        console.log('✅ Connected successfully!');

        const userCount = await User.countDocuments({});
        const eventCount = await Event.countDocuments({});
        const photoCount = await Photo.countDocuments({});

        console.log('\n📊 Database Status:');
        console.log(`   Users: ${userCount}`);
        console.log(`   Events: ${eventCount}`);
        console.log(`   Photos: ${photoCount}`);

        if (userCount === 0 && eventCount === 0 && photoCount === 0) {
            console.log('\n✅ Fresh database confirmed - ready to use!');
        } else {
            console.log('\n⚠️ Database has existing data');
        }

    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

run();
