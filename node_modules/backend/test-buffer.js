import axios from 'axios';
import dotenv from 'dotenv';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// You can use any local image path here. 
// I'll create a dummy buffer if no file exists or use a known one.
// Let's try to download a sample first to simulate a "uploaded file buffer".
import fetch from 'node-fetch';

const API_URL = process.env.HUGGING_FACE_API_URL;
const TEST_IMAGE_URL = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80";

const run = async () => {
    console.log("Downloading test image to buffer...");
    const res = await fetch(TEST_IMAGE_URL);
    const buffer = await res.buffer();

    console.log(`Buffer size: ${buffer.length}`);

    const formData = new FormData();
    // This matches exactly what externalAiService.js does
    formData.append('file', buffer, 'image.jpg');

    console.log("Sending to /analyze-file...");

    try {
        const client = axios.create({ baseURL: API_URL, timeout: 30000 });
        const response = await client.post('/analyze-file', formData, {
            headers: formData.getHeaders()
        });

        console.log("Status:", response.status);
        console.log("Data:", JSON.stringify(response.data).substring(0, 200));

        if (response.data.descriptors && response.data.descriptors.length > 0) {
            console.log("✅ SUCCESS: Face detected in Buffer!");
        } else {
            console.log("❌ FAILURE: No face detected in Buffer.");
        }

    } catch (e) {
        console.error("❌ ERROR:", e.message);
        if (e.response) console.error("Response:", e.response.data);
    }
};

run();
