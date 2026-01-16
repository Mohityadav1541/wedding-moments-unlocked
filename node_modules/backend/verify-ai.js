import axios from 'axios';
import dotenv from 'dotenv';
import FormData from 'form-data';
import fetch from 'node-fetch';

dotenv.config();

const API_URL = process.env.HUGGING_FACE_API_URL;

console.log(`Checking AI Service at: ${API_URL}`);

const TEST_IMAGE_URL = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80";

const verify = async () => {
    try {
        console.log("1. Fetching test image...");
        const res = await fetch(TEST_IMAGE_URL);
        const buffer = await res.buffer();
        console.log(`   Image fetched: ${buffer.length} bytes`);

        const form = new FormData();
        form.append('file', buffer, 'test.jpg');

        const axiosClient = axios.create({ baseURL: API_URL, timeout: 60000, headers: form.getHeaders() });

        console.log("2. Sending request to /analyze-file ...");
        const aiRes = await axiosClient.post('/analyze-file', form);

        console.log("3. Response received!");
        console.log(`   Status: ${aiRes.status}`);

        const data = aiRes.data;
        if (data.descriptors && Array.isArray(data.descriptors)) {
            console.log(`   ✅ SUCCESS: Received ${data.descriptors.length} face descriptor(s).`);
            console.log(`   Descriptor length: ${data.descriptors[0]?.length} (Expected 128)`);
        } else {
            console.log("   ⚠️ WARNING: Connected but format unexpected:", JSON.stringify(data).substring(0, 200));
        }

    } catch (error) {
        console.error("   ❌ FAIL: ", error.message);
        if (error.response) {
            console.error("   Response Data:", error.response.data);
            console.error("   Response Status:", error.response.status);
        }
    }
};

verify();
