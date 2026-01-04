import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.HUGGING_FACE_API_URL;

// Euclidean distance threshold for face matching
// 0.6 is the standard threshold for dlib/face_recognition
const MATCH_THRESHOLD = 0.5; // Slightly stricter for better accuracy

const getClient = () => {
    if (!API_URL) {
        console.warn("[AI Service] HUGGING_FACE_API_URL is not set in .env");
        return null;
    }
    return axios.create({
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 30000 // 30s timeout for AI processing
    });
};

/**
 * Get descriptor for a single face in the image.
 * Returns null if no face or multiple faces (optional policy).
 */
export const getFaceDescriptor = async (imageUrl) => {
    try {
        const client = getClient();
        if (!client) return null;

        console.log(`[AI Service] Analyzing: ${imageUrl}`);
        const response = await client.post('/analyze-url', { url: imageUrl });

        const { descriptors } = response.data;

        if (descriptors && descriptors.length > 0) {
            // Return the first face found
            return descriptors[0];
        }
        return null;
    } catch (error) {
        console.error("[AI Service] Error getting descriptor:", error.message);
        return null;
    }
};

/**
 * Get all face descriptors from an image.
 */
export const getAllFaceDescriptors = async (imageUrl) => {
    try {
        const client = getClient();
        if (!client) return [];

        console.log(`[AI Service] Analyzing (All): ${imageUrl}`);
        const response = await client.post('/analyze-url', { url: imageUrl });

        const { descriptors } = response.data;
        return descriptors || [];
    } catch (error) {
        console.error("[AI Service] Error getting descriptors:", error.message);
        return [];
    }
};

/**
 * Check if two descriptors match.
 * Descriptors are arrays of numbers (vectors).
 */
export const isMatch = (descriptor1, descriptor2) => {
    if (!descriptor1 || !descriptor2 || descriptor1.length !== descriptor2.length) {
        return false;
    }

    // Euclidean distance calculation
    let sum = 0;
    for (let i = 0; i < descriptor1.length; i++) {
        const diff = descriptor1[i] - descriptor2[i];
        sum += diff * diff;
    }
    const distance = Math.sqrt(sum);

    console.log(`[AI Match] Distance: ${distance.toFixed(4)} (Threshold: ${MATCH_THRESHOLD})`);
    return distance < MATCH_THRESHOLD;
};
