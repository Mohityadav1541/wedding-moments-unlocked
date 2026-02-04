import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const listDbs = async () => {
    const uri = process.env.MONGO_URI;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const admin = client.db().admin();
        const result = await admin.listDatabases();

        console.log("Databases:");
        result.databases.forEach(db => console.log(` - ${db.name} (Size: ${db.sizeOnDisk})`));

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
};

listDbs();
