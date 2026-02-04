import axios from 'axios';
import dotenv from 'dotenv';
import FormData from 'form-data';
import fetch from 'node-fetch';

dotenv.config();

const API_URL = process.env.HUGGING_FACE_API_URL;
// Euclidean distance threshold for face matching
// 0.6 is the standard threshold for dlib/face_recognition
// Lowered to 0.5 to reduce false positives
// Increased back to 0.6 because 0.5 was too loose (user reported 19 false positives)
// Increased to 0.7 because 0.6 still matched different people (Biden vs Obama)
export const MATCH_THRESHOLD = 0.7;

const getClient = () => {
    if (!API_URL) {
        console.warn("[AI Service] HUGGING_FACE_API_URL is not set in .env");
        return null;
    }
    return axios.create({
        baseURL: API_URL,
        timeout: 60000 // Increased timeout to 60s
    });
};

/**
 * Helper delay function
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get descriptor for a single face in the image (Buffer or Path).
 * Now supports Buffers for privacy (no storage).
 */
export const getFaceDescriptor = async (imageInput, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const client = getClient();
            if (!client) return null;

            if (typeof imageInput === 'string' && imageInput.startsWith('http')) {
                console.log(`[AI Service] Analyzing Single URL: ${imageInput} (Attempt ${i + 1}/${retries})...`);
                const response = await client.post('/analyze-url', { url: imageInput });
                const data = response.data;

                // Expecting { descriptors: [ ... ] } or [ { embedding: ... } ]
                if (data.descriptors && Array.isArray(data.descriptors) && data.descriptors.length > 0) {
                    return data.descriptors[0];
                }
                if (Array.isArray(data) && data.length > 0 && data[0].embedding) {
                    return data[0].embedding;
                }
                return null;
            }

            console.warn("[AI Service] Buffer not supported on /analyze-url. Returning NULL.");
            return null;
        } catch (error) {
            console.error(`[AI Service] Attempt ${i + 1} failed:`, error.message);
            if (error.response) {
                console.error("[AI Service] Response data:", error.response.data);
            }

            if (i === retries - 1) {
                console.error("[AI Service] All retries failed. Returning null.");
                return null;
            }
            console.log(`[AI Service] Retrying in 2 seconds...`);
            await delay(2000);
        }
    }
};

/**
 * Get all face descriptors from an image.
 */
export const getAllFaceDescriptors = async (imageInput, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const client = getClient();
            if (!client) return [];

            if (typeof imageInput === 'string' && imageInput.startsWith('http')) {
                console.log(`[AI Service] Analyzing URL: ${imageInput} (Attempt ${i + 1}/${retries})...`);
                const response = await client.post('/analyze-url', { url: imageInput });
                const data = response.data;

                if (data.descriptors && Array.isArray(data.descriptors)) {
                    return data.descriptors;
                }
                if (Array.isArray(data)) return data.map(face => face.embedding);

                return [];
            } else {
                console.warn("[AI Service] Buffer/File not supported on /analyze-url. Skipping.");
                return [];
            }
        } catch (error) {
            console.error(`[AI Service] Attempt ${i + 1} failed:`, error.message);
            if (error.response) {
                console.error("[AI Service] Response data:", error.response.data);
            }
            if (i === retries - 1) return [];
            await delay(2000);
        }
    }
};

/**
 * Calculate Cosine Similarity between two descriptors.
 * Returns a value between -1 and 1.
 * 1.0 means identical.
 */
export const getCosineSimilarity = (descriptor1, descriptor2) => {
    if (!descriptor1 || !descriptor2 || descriptor1.length !== descriptor2.length) {
        return -1.0; // Invalid
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < descriptor1.length; i++) {
        dotProduct += descriptor1[i] * descriptor2[i];
        normA += descriptor1[i] * descriptor1[i];
        normB += descriptor2[i] * descriptor2[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Check match with new threshold
 * Threshold: > 0.6 is usually a good match for ArcFace (buffalo_s).
 */
export const isMatch = (descriptor1, descriptor2) => {
    const similarity = getCosineSimilarity(descriptor1, descriptor2);
    // console.log(`[AI Match] Similarity: ${similarity.toFixed(4)} (Threshold: > 0.6)`);
    return similarity > MATCH_THRESHOLD;
};
