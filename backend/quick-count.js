import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import Photo from './src/models/Photo.js';

dotenv.config();
connectDB();

const run = async () => {
    try {
        const total = await Photo.countDocuments({});
        const withData = await Photo.countDocuments({ $expr: { $gt: [{ $size: "$faceDescriptors" }, 0] } });
        console.log(JSON.stringify({ total, withData, withoutData: total - withData }));
        process.exit();
    } catch (e) { console.error(e); process.exit(1); }
};
setTimeout(run, 3000);
