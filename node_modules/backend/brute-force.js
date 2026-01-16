import axios from 'axios';
import dotenv from 'dotenv';
import FormData from 'form-data';
import fetch from 'node-fetch';

dotenv.config();
const API_URL = process.env.HUGGING_FACE_API_URL;
const TEST_IMAGE_URL = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80";

const endpoints = [
    '/analyze',
    '/predict',
    '/api/predict',
    '/run/predict',
    '/',
    '/api/analyze',
    '/v1/analyze'
];

const run = async () => {
    console.log(`Target Base: ${API_URL}`);
    const res = await fetch(TEST_IMAGE_URL);
    const buffer = await res.buffer();

    const form = new FormData();
    form.append('file', buffer, 'test.jpg');

    for (const ep of endpoints) {
        process.stdout.write(`Testing ${ep} ... `);
        try {
            const client = axios.create({ baseURL: API_URL, timeout: 5000 });
            const response = await client.post(ep, form, { headers: form.getHeaders() });
            console.log(`✅ ${response.status} OK`.green);
            console.log("Response:", JSON.stringify(response.data).substring(0, 100));
            // Found it!
        } catch (e) {
            const status = e.response ? e.response.status : 'ERR';
            console.log(`❌ ${status} (${e.message})`);
        }
    }
};
run();
