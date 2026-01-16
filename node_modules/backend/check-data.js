import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import connectDB from './src/config/db.js';
import Photo from './src/models/Photo.js';
import Event from './src/models/Event.js';

dotenv.config();
connectDB();

const checkData = async () => {
    try {
        console.log('Checking Photo Data...'.cyan);

        const totalPhotos = await Photo.countDocuments({});
        console.log(`Total Photos in DB: ${totalPhotos}`);

        if (totalPhotos === 0) {
            console.log('No photos found. Upload some photos to the event first!'.yellow);
            process.exit();
        }

        const photosWithDescriptors = await Photo.countDocuments({
            $expr: { $gt: [{ $size: "$faceDescriptors" }, 0] }
        });

        const photosWithoutDescriptors = totalPhotos - photosWithDescriptors;

        console.log(`Photos WITH Face Data: ${photosWithDescriptors}`.green);
        console.log(`Photos WITHOUT Face Data: ${photosWithoutDescriptors}`.red);

        if (photosWithoutDescriptors > 0) {
            console.log('\n❌ PROBLEM DETECTED:');
            console.log(`You have ${photosWithoutDescriptors} photos that were uploaded WITHOUT AI processing.`);
            console.log('The search feature CANNOT find you in these photos.');
            console.log('Solution: Delete these photos and re-upload them now that the AI is working.');
        } else {
            console.log('\n✅ Data looks good. All photos have face data.');
            console.log('If search fails, it might be a matching threshold issue.');
        }

        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

setTimeout(checkData, 3000);
