import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const listCollections = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connected to: ${mongoose.connection.name}`);

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections:");
        collections.forEach(c => console.log(` - ${c.name}`));

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
};

listCollections();
