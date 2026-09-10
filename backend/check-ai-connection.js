import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.HUGGING_FACE_API_URL;
console.log(`Checking connection to: ${url}`);

if (!url) {
    console.error("HUGGING_FACE_API_URL is missing in .env");
    process.exit(1);
}

const config = {};
if (process.env.HF_TOKEN) {
    config.headers = { 'Authorization': `Bearer ${process.env.HF_TOKEN}` };
}

try {
    const res = await axios.get(url, config);
    console.log(`Status: ${res.status}`);
    console.log(`Data:`, res.data);
    console.log("✅ AI Service is reachable!");
} catch (error) {
    console.error(`❌ Connection failed: ${error.message}`);
    if (error.response) {
        console.error(`Status: ${error.response.status}`);
    }
}
