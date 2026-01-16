import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import connectDB from './src/config/db.js';
import Photo from './src/models/Photo.js';

dotenv.config();
connectDB();

const resetPhotos = async () => {
    try {
        console.log('Resetting Photo Data...'.cyan);

        const result = await Photo.deleteMany({});

        console.log(`✅ SUCCESS: Deleted ${result.deletedCount} photos.`.green.bold);
        console.log('\nThe database is now clean.');
        console.log('Please go to the Dashboard and re-upload your event photos.');
        console.log('Each photo will now be processed by the AI correctly.');

        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

setTimeout(resetPhotos, 3000);
