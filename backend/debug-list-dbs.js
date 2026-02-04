import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
    try {
        console.log("Connecting to Mongo Cluster...");
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected!');

        // Use the native driver to list databases
        const admin = mongoose.connection.db.admin();
        const result = await admin.listDatabases();

        console.log("\nAvailable Databases:");
        result.databases.forEach(db => {
            console.log(` - ${db.name} \t(Size: ${db.sizeOnDisk})`);
        });

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

run();
