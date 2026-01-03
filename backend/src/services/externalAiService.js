import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

// Configuration
// Direct URL to the Python AI Service (Hugging Face Space)
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'https://mohit00000-wedding-moments-ai.hf.space';

/**
 * Gets the face descriptor (embedding) for a single face in the image.
 * @param {string} imageUrl - The Cloudinary URL or local file path of the image.
 * @returns {Promise<Array<number>|null>} - The 512-d vector or null if no face found.
 */
export const getFaceDescriptor = async (imageUrl) => {
    try {
        console.log(`[AI Service] Analyzing Single Face: ${imageUrl}`);
        const formData = new FormData();

        // Stream the image from Cloudinary/Web directly to the Python Service
        // This avoids saving it to disk locally on the Node server
        if (imageUrl.startsWith('http')) {
            const response = await axios.get(imageUrl, { responseType: 'stream' });
            formData.append('file', response.data, 'image.jpg');
        } else {
            // Fallback for local testing
            formData.append('file', fs.createReadStream(imageUrl));
        }

        // Send to Python AI
        const response = await axios.post(`${AI_SERVICE_URL}/analyze`, formData, {
            headers: {
                ...formData.getHeaders()
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 60000 // 60s timeout for cold starts
        });

        const faces = response.data;
        if (!faces || faces.length === 0) {
            console.log("[AI Service] No faces detected.");
            return null;
        }

        // Return the first face's embedding
        return faces[0].embedding;

    } catch (error) {
        console.error("[AI Service] Error:", error.message);
        if (error.response) {
            console.error("[AI Service] Response Data:", error.response.data);
        }
        // Return null so the app doesn't crash, just says "No face found"
        return null;
    }
};

/**
 * Gets descriptors for ALL faces in an image (for Event Photos).
 * @param {string} imageUrl - The Cloudinary URL.
 * @returns {Promise<Array<Array<number>>>} - Array of vectors.
 */
export const getAllFaceDescriptors = async (imageUrl) => {
    try {
        console.log(`[AI Service] Analyzing All Faces: ${imageUrl}`);
        const formData = new FormData();

        if (imageUrl.startsWith('http')) {
            const response = await axios.get(imageUrl, { responseType: 'stream' });
            formData.append('file', response.data, 'image.jpg');
        } else {
            formData.append('file', fs.createReadStream(imageUrl));
        }

        const response = await axios.post(`${AI_SERVICE_URL}/analyze`, formData, {
            headers: { ...formData.getHeaders() },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 120000 // Longer timeout for event photos (large files)
        });

        const faces = response.data;
        if (!faces || faces.length === 0) return [];

        // Return just the embeddings array
        return faces.map(face => face.embedding);

    } catch (error) {
        console.error("[AI Service] Batch Error:", error.message);
        return [];
    }
};

/**
 * Calculates similarity between two face descriptors.
 * @param {Array<number>} descriptor1 
 * @param {Array<number>} descriptor2 
 * @returns {boolean} - True if match
 */
export const isMatch = (descriptor1, descriptor2) => {
    // Cosine Similarity
    let dot = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < descriptor1.length; i++) {
        dot += descriptor1[i] * descriptor2[i];
        norm1 += descriptor1[i] * descriptor1[i];
        norm2 += descriptor2[i] * descriptor2[i];
    }

    const similarity = dot / (Math.sqrt(norm1) * Math.sqrt(norm2));

    // Threshold: 0.45 is a balanced point for ArcFace
    // > 0.45 is a match
    return similarity > 0.45;
};
