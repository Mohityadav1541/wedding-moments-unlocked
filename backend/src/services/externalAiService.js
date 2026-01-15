import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.HUGGING_FACE_API_URL;

// Euclidean distance threshold for face matching
// 0.6 is the standard threshold for dlib/face_recognition
const MATCH_THRESHOLD = 0.6; // Standard dlib threshold (0.6) for better recall

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
 * Get descriptor for a single face in the image (Buffer or Path).
 * Now supports Buffers for privacy (no storage).
 */
export const getFaceDescriptor = async (imageInput) => {
    try {
        const client = getClient();
        if (!client) return null;

        const formData = new FormData();

        if (Buffer.isBuffer(imageInput)) {
            formData.append('file', new Blob([imageInput]), 'image.jpg');
        } else if (typeof imageInput === 'string') {
            // Fallback for file path (though we prefer buffers now)
            // If it's a URL, we can't easily send it to /analyze which expects file
            // So we skip or fetch it. For now, assuming local path or buffer.
            // If local path:
            // const fs = await import('fs');
            // formData.append('file', fs.createReadStream(imageInput));
            console.warn("[AI Service] String path support deprecated for search. Use Buffer.");
            return null;
        }

        console.log(`[AI Service] Analyzing Buffer...`);
        // Do NOT set Content-Type manually for FormData with axios/fetch, 
        // it needs to generate the boundary.
        const response = await client.post('/analyze', formData);

        // Response is array of faces
        const faces = response.data;

        if (faces && faces.length > 0) {
            // Return expectation: just the embedding array
            return faces[0].embedding;
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
        // Check if input is a URL (Cloudinary) or Buffer
        // If it's a Cloudinary URL, we unfortunately have to fetch it first or keep using the old way 
        // BUT the Python service only supports file upload on /analyze now (as per my plan).
        // So for event photos (already on Cloudinary), we might need to fetch stream.

        if (typeof imageInput === 'string' && imageInput.startsWith('http')) {
            const fetch = (await import('node-fetch')).default;
            const res = await fetch(imageInput);
            const blob = await res.blob();
            // Node fetch blob to buffer
            const arrayBuffer = await blob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            formData.append('file', new Blob([buffer]), 'image.jpg');
        } else {
            // Assume buffer or fail
            console.warn("[AI Service] getAllFaceDescriptors requires URL or Buffer");
            return [];
        }

        console.log(`[AI Service] Analyzing (All)...`);
        const response = await client.post('/analyze', formData);

        // Response is array of objects { embedding: [...] }
        const faces = response.data;
        return faces.map(f => f.embedding) || [];
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
