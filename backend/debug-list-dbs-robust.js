import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Hardcoded Prod URI
const MONGO_URI = "mongodb+srv://yadavboy1540_db_user:Hi14ydt2lm2uXmKl@cluster0.y8mhlfw.mongodb.net/?appName=Cluster0";

const run = async () => {
    try {
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        const admin = mongoose.connection.db.admin();
        const result = await admin.listDatabases();

        console.log("--------------------");
        console.log("DATABASES FOUND:");
        result.databases.forEach(db => {
            console.log(`DB: ${db.name} | Size: ${db.sizeOnDisk}`);
        });
        console.log("--------------------");

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
