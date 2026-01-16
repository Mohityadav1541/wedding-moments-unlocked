import axios from 'axios';
import dotenv from 'dotenv';
import FormData from 'form-data';
import fetch from 'node-fetch';

dotenv.config();

const API_URL = process.env.HUGGING_FACE_API_URL;

console.log(`Testing AI Service at: ${API_URL}`);

// A known good image with a face (stock photo)
const TEST_IMAGE_URL = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80";

const testAi = async () => {
    try {
        console.log("Fetching test image...");
        const res = await fetch(TEST_IMAGE_URL);
        const buffer = await res.buffer();
        console.log(`Got image buffer: ${buffer.length} bytes`);

        const form = new FormData();
        form.append('file', buffer, 'test.jpg');

        const axiosClient = axios.create({ baseURL: API_URL, timeout: 30000, headers: form.getHeaders() });

        console.log("\nAttempt 1: /analyze");
        try {
            const res = await axiosClient.post('/analyze', form);
            console.log("✅ /analyze WORKS!");
            console.log("Data:", JSON.stringify(res.data).substring(0, 100));
            return;
        } catch (e) {
            console.log("❌ /analyze failed: " + e.message);
            if (e.response) console.log("Status:", e.response.status, e.response.statusText);
        }

        console.log("\nAttempt 2: /predict");
        try {
            const res = await axiosClient.post('/predict', form);
            console.log("✅ /predict WORKS!");
            console.log("Data:", JSON.stringify(res.data).substring(0, 100));
            return;
        } catch (e) {
            console.log("❌ /predict failed: " + e.message);
            if (e.response) console.log("Status:", e.response.status, e.response.statusText);
        }

        console.log("\nAttempt 3: / (Root)");
        try {
            const res = await axiosClient.post('/', form);
            console.log("✅ / WORKS!");
            console.log("Data:", JSON.stringify(res.data).substring(0, 100));
            return;
        } catch (e) {
            console.log("❌ / failed: " + e.message);
            if (e.response) console.log("Status:", e.response.status, e.response.statusText);
        }

    } catch (error) {
        console.error("❌ ERROR:", error.message);
    }
};

testAi();
