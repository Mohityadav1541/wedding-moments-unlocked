import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Photo from './src/models/Photo.js';
import User from './src/models/User.js';
import Event from './src/models/Event.js';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const checkPending = async () => {
    await connectDB();

    // Aggregate photos by Event
    const stats = await Photo.aggregate([
        {
            $group: {
                _id: "$event",
                total: { $sum: 1 },
                pending: {
                    $sum: {
                        $cond: [
                            {
                                $or: [
                                    { $eq: ["$faceDescriptors", []] },
                                    { $not: ["$faceDescriptors"] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                }
            }
        },
        {
            $lookup: {
                from: "events",
                localField: "_id",
                foreignField: "_id",
                as: "eventDetails"
            }
        },
        {
            $project: {
                eventName: { $arrayElemAt: ["$eventDetails.name", 0] },
                total: 1,
                pending: 1
            }
        }
    ]);

    console.log(`\n\n--- PHOTOS BY EVENT ---`);
    if (stats.length === 0) {
        console.log("No photos found.");
    } else {
        stats.forEach(s => {
            console.log(`Event: ${s.eventName || 'Unknown/Deleted'} (ID: ${s._id})`);
            console.log(` - Total: ${s.total}`);
            console.log(` - Pending AI: ${s.pending}`);
        });
    }
    console.log(`-----------------------\n\n`);

    process.exit();
};

checkPending();
