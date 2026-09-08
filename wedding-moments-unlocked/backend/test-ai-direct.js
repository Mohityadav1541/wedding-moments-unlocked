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

        const axiosClient = axios.create({ baseURL: API_URL, timeout: 30000 });

        console.log("\nAttempting to probe Health Check (GET /)....");
        try {
            const res = await axiosClient.get('/');
            console.log("✅ Health Check OK!");
            console.log("Status:", res.status);
            console.log("Data:", JSON.stringify(res.data));
        } catch (e) {
            console.log("❌ Health Check failed: " + e.message);
            if (e.response) {
                console.log("Status:", e.response.status);
                console.log("Data:", typeof e.response.data === 'string' ? e.response.data.substring(0, 500) : JSON.stringify(e.response.data));
            }
        }

        console.log("\nAttempting /analyze-url using Optimized URL...");
        const optimizedUrl = TEST_IMAGE_URL.replace('&w=687', '&w=800'); // Simulate optimization

        try {
            const res = await axiosClient.post('/analyze-url', { url: optimizedUrl });
            console.log("✅ /analyze-url WORKS!");
            console.log("Status:", res.status);
            const data = res.data;
            if (data.descriptors && Array.isArray(data.descriptors)) {
                console.log(`Success! Found ${data.descriptors.length} faces.`);
                console.log("Descriptors found.");
            } else {
                console.log("Unexpected (but successful) response format:", JSON.stringify(data).substring(0, 200));
            }
        } catch (e) {
            console.log("❌ /analyze-url failed: " + e.message);
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
