import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Photo from './src/models/Photo.js'; // Adjust path if needed
import Event from './src/models/Event.js'; // Adjust path if needed

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Fetch last 10 photos matches { faceDescriptors: { $exists: true, $not: { $size: 0 } } }
        const photos = await Photo.find({
            $expr: { $gt: [{ $size: "$faceDescriptors" }, 0] }
        })
            .sort({ createdAt: -1 })
            .limit(10);

        console.log(`Found ${photos.length} photos with descriptors.`);

        photos.forEach((p, idx) => {
            console.log(`\n[${idx + 1}] Photo ID: ${p._id}`);
            console.log(`    URL: ${p.url.slice(0, 50)}...`);
            const descriptors = p.faceDescriptors;
            console.log(`    Face Count: ${descriptors.length}`);

            descriptors.forEach((desc, dIdx) => {
                // Show first 10 dimensions of the vector
                const preview = desc.slice(0, 10).map(n => n.toFixed(4)).join(', ');
                console.log(`    Face ${dIdx + 1}: [${preview}, ...] (Total Dims: ${desc.length})`);
            });
        });

        // Also check if they are identical
        if (photos.length >= 2) {
            const d1 = photos[0].faceDescriptors[0];
            const d2 = photos[1].faceDescriptors[0];

            let dot = 0, nA = 0, nB = 0;
            for (let i = 0; i < d1.length; i++) {
                dot += d1[i] * d2[i];
                nA += d1[i] * d1[i];
                nB += d2[i] * d2[i];
            }
            const sim = dot / (Math.sqrt(nA) * Math.sqrt(nB));
            console.log(`\nSimilarity between Photo 1 and Photo 2: ${sim.toFixed(4)}`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
};

run();
