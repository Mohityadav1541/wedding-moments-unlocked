import axios from 'axios';
import dotenv from 'dotenv';
import FormData from 'form-data';
import fetch from 'node-fetch';

dotenv.config();

const API_URL = process.env.HUGGING_FACE_API_URL;
// User requested threshold in 0.5-0.6 range for better recall
export const MATCH_THRESHOLD = 0.6;

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

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Validate a descriptor to ensure it's not garbage (zeros, uniform, or NaN).
 */
export const isValidDescriptor = (descriptor) => {
    if (!Array.isArray(descriptor) || descriptor.length === 0) return false;

    // Check for NaN
    if (descriptor.some(n => isNaN(n))) {
        console.warn("[AI Service] Rejected descriptor: Contains NaN");
        return false;
    }

    // Check for All Zeros
    const isZero = descriptor.every(n => n === 0);
    if (isZero) {
        console.warn("[AI Service] Rejected descriptor: All Zeros");
        return false;
    }

    // Check Variance (Uniform values like [0.1, 0.1, 0.1] are garbage)
    const mean = descriptor.reduce((a, b) => a + b, 0) / descriptor.length;
    const variance = descriptor.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / descriptor.length;

    if (variance < 0.0001) {
        console.warn(`[AI Service] Rejected descriptor: Low Variance (${variance.toFixed(6)})`);
        return false;
    }

    return true;
};

export const getFaceDescriptor = async (imageInput, retries = 15) => {
    for (let i = 0; i < retries; i++) {
        try {
            const client = getClient();
            if (!client) return null;

            if (typeof imageInput === 'string' && imageInput.startsWith('http')) {
                console.log(`[AI Service] Analyzing Single URL: ${imageInput} (Attempt ${i + 1}/${retries})...`);
                const response = await client.post('/analyze-url', { url: imageInput });
                const data = response.data;

                let vector = null;
                if (data.descriptors && Array.isArray(data.descriptors) && data.descriptors.length > 0) {
                    vector = data.descriptors[0];
                } else if (Array.isArray(data) && data.length > 0 && data[0].embedding) {
                    vector = data[0].embedding;
                }

                if (vector && isValidDescriptor(vector)) {
                    return vector;
                }
                return null;
            }

            console.warn("[AI Service] Buffer not supported on /analyze-url. Returning NULL.");
            return null;
        } catch (error) {
            console.warn(`[AI Service] Attempt ${i + 1} failed. Retrying in 4s...`);
            if (i === retries - 1) return null;
            await delay(4000);
        }
    }
    return null;
};

export const getAllFaceDescriptors = async (imageInput, retries = 15) => {
    for (let i = 0; i < retries; i++) {
        try {
            const client = getClient();
            if (!client) return [];

            if (typeof imageInput === 'string' && imageInput.startsWith('http')) {
                console.log(`[AI Service] Analyzing URL: ${imageInput} (Attempt ${i + 1}/${retries})...`);
                const response = await client.post('/analyze-url', { url: imageInput });
                const data = response.data;

                let vectors = [];
                if (data.descriptors && Array.isArray(data.descriptors)) {
                    vectors = data.descriptors;
                } else if (Array.isArray(data)) {
                    vectors = data.map(face => face.embedding);
                }

                // Filter invalid vectors
                return vectors.filter(v => isValidDescriptor(v));
            } else {
                console.warn("[AI Service] Buffer/File not supported on /analyze-url. Skipping.");
                return [];
            }
        } catch (error) {
            console.warn(`[AI Service] Attempt ${i + 1} failed (503/Error). Retrying in 4s...`);
            if (i === retries - 1) return [];
            await delay(4000); // Wait 4s between retries (Total ~60s patience)
        }
    }
    return [];
};

export const getCosineSimilarity = (descriptor1, descriptor2) => {
    if (!descriptor1 || !descriptor2 || descriptor1.length !== descriptor2.length) {
        return -1.0;
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

export const isMatch = (descriptor1, descriptor2) => {
    const similarity = getCosineSimilarity(descriptor1, descriptor2);
    return similarity > MATCH_THRESHOLD;
};
