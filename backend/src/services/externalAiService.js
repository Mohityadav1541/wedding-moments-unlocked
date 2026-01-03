import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

// Configuration
// Using the direct space URL. 
// Note: Hugging Face Spaces free tier "cold starts" after inactivity.
// We need to handle potential timeouts or initial slow responses.
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'https://mohit00000-wedding-moments-ai.hf.space';

export const getFaceDescriptor = async (imagePathOrUrl) => {
    try {
        const formData = new FormData();

        // Handle URL vs Local File
        if (imagePathOrUrl.startsWith('http')) {
            // If it's a URL (Cloudinary), we need to fetch it as a stream first
            const response = await axios.get(imagePathOrUrl, { responseType: 'stream' });
            formData.append('file', response.data, 'image.jpg');
        } else {
            // Local file (multer upload)
            formData.append('file', fs.createReadStream(imagePathOrUrl));
        }

        console.log(`Sending image to AI Service at ${AI_SERVICE_URL}/analyze...`);

        const response = await axios.post(`${AI_SERVICE_URL}/analyze`, formData, {
            headers: {
                ...formData.getHeaders()
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 60000 // 60s timeout for cold starts
        });

        const faces = response.data;
        if (!faces || faces.length === 0) return null;

        // Return embedding of the primary face (first one)
        return faces[0].embedding;

    } catch (error) {
        console.error("External AI Service Error:", error.message);
        if (error.response) {
            console.error("AI Service Response:", error.response.data);
        }
        return null;
    }
};

export const getAllFaceDescriptors = async (imagePathOrUrl) => {
    try {
        const formData = new FormData();

        if (imagePathOrUrl.startsWith('http')) {
            const response = await axios.get(imagePathOrUrl, { responseType: 'stream' });
            formData.append('file', response.data, 'image.jpg');
        } else {
            formData.append('file', fs.createReadStream(imagePathOrUrl));
        }

        const response = await axios.post(`${AI_SERVICE_URL}/analyze`, formData, {
            headers: { ...formData.getHeaders() },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 60000 // Cloudinary URLs might be slower + processing
        });

        const faces = response.data;
        if (!faces || faces.length === 0) return [];

        return faces.map(face => face.embedding);

    } catch (error) {
        console.error("External AI Service Error (Batch):", error.message);
        return [];
    }
};

export const isMatch = (descriptor1, descriptor2, threshold = 0.5) => {
    // Cosine Similarity implementation in JS
    // (Assuming descriptors are normalized, which ArcFace usually returns)
    // If not normalized, we'd need to divide by norms.
    // The Python service returns lists of floats.

    // Dot product
    let dot = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < descriptor1.length; i++) {
        dot += descriptor1[i] * descriptor2[i];
        norm1 += descriptor1[i] * descriptor1[i];
        norm2 += descriptor2[i] * descriptor2[i];
    }

    const similarity = dot / (Math.sqrt(norm1) * Math.sqrt(norm2));

    // ArcFace threshold: usually > 0.4 is a good balance for recall.
    // Lower means STRICTER for Euclidean, but HIGHER means STRICTER for Cosine Similarity.
    // Since this is Cosine Similarity (dot product), higher value = more similar.
    // Wait, the current logic return similarity > threshold.
    // So 0.5 is strictly 0.5. To find MORE photos (improve recall), we need to LOWER the required similarity.
    // Let's try 0.40 which is a common lenient threshold for ArcFace.
    return similarity > 0.4;
};
