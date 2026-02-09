import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const updateResult = await mongoose.connection.collection('photos').createIndexes([
            { key: { event: 1 }, name: "event_1" },
            { key: { aiProcessed: 1 }, name: "aiProcessed_1" }
        ]);
        console.log('Indexes ensured:', updateResult);

        const indexes = await mongoose.connection.collection('photos').indexes();
        console.log('Current Indexes on photos:', indexes);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

connectDB();
