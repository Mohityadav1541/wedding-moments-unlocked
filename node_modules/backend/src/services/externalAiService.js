import axios from 'axios';
import dotenv from 'dotenv';
import FormData from 'form-data';
import fetch from 'node-fetch';

dotenv.config();

const API_URL = process.env.HUGGING_FACE_API_URL;
// Euclidean distance threshold for face matching
// 0.6 is the standard threshold for dlib/face_recognition
const MATCH_THRESHOLD = 0.6;

const getClient = () => {
    if (!API_URL) {
        console.warn("[AI Service] HUGGING_FACE_API_URL is not set in .env");
        return null;
    }
    return axios.create({
        baseURL: API_URL,
        timeout: 30000
    });
};

/**
 * Get descriptor for a single face in the image (Buffer or Path).
 * Now supports Buffers for privacy (no storage).
 */
export const getFaceDescriptor = async (imageInput) => {
    try {
        const client = getClient();
        if (!client) return null;

        const formData = new FormData();

        if (Buffer.isBuffer(imageInput)) {
            formData.append('file', imageInput, 'image.jpg');
        } else if (typeof imageInput === 'string') {
            console.warn("[AI Service] String path support deprecated for search. Use Buffer.");
            return null;
        } else {
            return null;
        }

        console.log(`[AI Service] Analyzing Buffer...`);

        // Pass headers from form-data to axios
        // Endpoint: /analyze-file (from app.py)
        const response = await client.post('/analyze-file', formData, {
            headers: formData.getHeaders()
        });

        // Response format: { descriptors: [ [128 floats], ... ] }
        const data = response.data;

        if (data && data.descriptors && data.descriptors.length > 0) {
            return data.descriptors[0];
        }
        return null;
    } catch (error) {
        console.error("[AI Service] Error getting descriptor:", error.message);
        if (error.response) {
            console.error("[AI Service] Response data:", error.response.data);
        }
        return null;
    }
};

/**
 * Get all face descriptors from an image.
 */
export const getAllFaceDescriptors = async (imageInput) => {
    try {
        const client = getClient();
        if (!client) return [];

        const formData = new FormData();

        if (typeof imageInput === 'string' && imageInput.startsWith('http')) {
            const res = await fetch(imageInput);
            const buffer = await res.buffer();
            formData.append('file', buffer, 'image.jpg');
        } else if (Buffer.isBuffer(imageInput)) {
            formData.append('file', imageInput, 'image.jpg');
        } else {
            // Assume buffer or fail
            console.warn("[AI Service] getAllFaceDescriptors requires URL or Buffer");
            return [];
        }

        console.log(`[AI Service] Analyzing (All)...`);

        // Endpoint: /analyze-file
        const response = await client.post('/analyze-file', formData, {
            headers: formData.getHeaders()
        });

        const data = response.data;
        // API returns { descriptors: ... }
        return data.descriptors || [];
    } catch (error) {
        console.error("[AI Service] Error getting descriptors:", error.message);
        if (error.response) {
            console.error("[AI Service] Response data:", error.response.data);
        }
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
