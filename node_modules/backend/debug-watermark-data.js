import mongoose from 'mongoose';
import Event from './src/models/Event.js';
import User from './src/models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = "mongodb+srv://dineshyadav1540:dineshyadav1540@cluster0.1lzsu.mongodb.net/wedding-moments?retryWrites=true&w=majority&appName=Cluster0";
const EVENT_ID = '69831fbb95aa9b514c5e563b';

const run = async () => {
    try {
        await mongoose.connect(API_URL);
        console.log("Connected to DB");

        const event = await Event.findById(EVENT_ID).populate('user');
        if (!event) {
            console.log("Event not found");
            return;
        }

        console.log("Event Name:", event.name);
        console.log("Event User:", event.user?.name);
        console.log("Event User Studio:", event.user?.studioName);
        console.log("Watermark Enabled:", event.features?.watermarkEnabled);
        console.log("Watermark Text:", event.features?.watermarkText);

        // Simulation of Controller Logic
        const eventFeatures = event.features;
        let watermarkText = eventFeatures.watermarkText;
        if (!watermarkText && event.user) {
            watermarkText = event.user.studioName || event.user.name;
        }
        if (!watermarkText) watermarkText = 'Wedding Moments AI';

        console.log("Final Watermark Text:", watermarkText);

        // Simulation of Cloudinary URL
        const text = encodeURIComponent(watermarkText);
        // CURRENT CODE:
        const transformationWrong = `/l_text:Arial_60_bold:${text},g_south,y_50,co_white,o_90,b_rgb:00000050,fl_layer_apply`;

        console.log("Generated Trans Part:", transformationWrong);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
