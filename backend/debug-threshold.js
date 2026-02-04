import dotenv from 'dotenv';
dotenv.config();

import { getAllFaceDescriptors, getCosineSimilarity, MATCH_THRESHOLD } from './src/services/externalAiService.js';
import colors from 'colors';

// Known images
const TOM_1 = "https://raw.githubusercontent.com/ageitgey/face_recognition/master/examples/biden.jpg";
const BRAD = "https://raw.githubusercontent.com/ageitgey/face_recognition/master/examples/obama.jpg";

const printVector = (label, vec) => {
    if (!vec) {
        console.log(`${label}: NULL`);
        return;
    }
    const sample = vec.slice(0, 5).map(n => n.toFixed(4)).join(', ');
    const norm = Math.sqrt(vec.reduce((s, n) => s + n * n, 0));
    console.log(`${label}: [${sample}...] (Len: ${vec.length}, Norm: ${norm.toFixed(4)})`);
};

async function runDebug() {
    console.log(`Using Threshold: ${MATCH_THRESHOLD}`.yellow);
    console.log(`API URL: ${process.env.HUGGING_FACE_API_URL}`.cyan);

    try {
        console.log("\n1. Fetching Biden...");
        const desc1 = await getAllFaceDescriptors(TOM_1);
        const biden = desc1[0];
        printVector("Biden", biden);

        console.log("\n2. Fetching Obama...");
        const desc2 = await getAllFaceDescriptors(BRAD);
        const obama = desc2[0];
        printVector("Obama", obama);

        if (biden && obama) {
            const sim = getCosineSimilarity(biden, obama);
            console.log(`\nSimilarity (Biden vs Obama): ${sim.toFixed(6)}`);

            if (sim > 0.9) {
                console.log("❌ FAILURE: Biden and Obama match! The AI is returning a CONSTANT or GENERIC vector.".red);
            } else if (sim > MATCH_THRESHOLD) {
                console.log("⚠️ WARNING: False Positive. Similarity is high but vectors differ.".yellow);
            } else {
                console.log("✅ SUCCESS: Vectors are distinct and correctly non-matching.".green);
            }
        } else {
            console.log("❌ FAILED to get descriptors.".red);
        }

    } catch (err) {
        console.error("CRITICAL ERROR:", err);
    }
}

runDebug();
