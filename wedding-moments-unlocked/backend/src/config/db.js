import mongoose from 'mongoose';
import dns from 'dns';

const connectDB = async () => {
  try {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (e) {}

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (error.message.includes('whitelisted') || error.message.includes('ENOTFOUND') || error.name === 'MongooseServerSelectionError') {
      console.warn("⚠️ TIP: Ensure 0.0.0.0/0 (Allow from anywhere) is added in MongoDB Atlas -> Network Access!");
    }
    console.log("Retrying MongoDB connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
