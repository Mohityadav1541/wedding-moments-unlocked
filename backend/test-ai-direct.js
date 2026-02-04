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

        console.log("\nAttempting to reach Root (/)....");
        try {
            const res = await axiosClient.get('/');
            console.log("✅ Root REACHABLE!");
            console.log("Status:", res.status);
            console.log("Data:", res.data);
        } catch (e) {
            console.log("❌ Root failed: " + e.message);
            if (e.response) {
                console.log("Status:", e.response.status);
                console.log("Headers:", JSON.stringify(e.response.headers));
                console.log("Data:", typeof e.response.data === 'string' ? e.response.data.substring(0, 500) : JSON.stringify(e.response.data));
            }
        }

        console.log("\nAttempting /analyze with fixed code path...");
        try { // Use POST for analyze as per app.py
            const res = await axiosClient.post('/analyze', form);
            console.log("✅ /analyze WORKS!");
            const data = res.data;
            if (Array.isArray(data)) {
                console.log(`Success! Found ${data.length} faces.`);
                if (data.length > 0) console.log("First embedding length:", data[0].embedding?.length);
            } else {
                console.log("Response not an array:", JSON.stringify(data).substring(0, 200));
            }
        } catch (e) {
            console.log("❌ /analyze failed: " + e.message);
            if (e.response) {
                console.log("Status:", e.response.status);
                console.log("Data:", typeof e.response.data === 'string' ? e.response.data.substring(0, 500) : JSON.stringify(e.response.data));
            }
        }

    } catch (error) {
        console.error("❌ ERROR:", error.message);
    }
};

testAi();
