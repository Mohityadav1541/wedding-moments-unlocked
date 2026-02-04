import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = process.env.HUGGING_FACE_API_URL;
const TEST_IMAGE_URL = 'https://res.cloudinary.com/dwjzce0ny/image/upload/v1770209760/wedding-ai/image-1770209759776.jpg';

console.log("Checking AI Service at:", API_URL);

async function testService() {
    try {
        console.log("Sending request to /analyze-url...");
        const res = await axios.post(`${API_URL}/analyze-url`, { url: TEST_IMAGE_URL }, {
            timeout: 10000
        });
        console.log("STATUS:", res.status);
        console.log("DATA:", JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.error("ERROR:");
        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Data:", error.response.data);
        } else {
            console.log(error.message);
        }
    }
}

testService();
