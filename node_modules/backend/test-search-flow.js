import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

// CONFIG
const API_URL = 'http://localhost:5000/api'; // Or the live URL if local not running
const EVENT_ID = '69831fbb95aa9b514c5e563b'; // User's active event ID (from prior screenshots)
// Using the uploaded media as a test selfie if available, else I'll need a path
const TEST_IMAGE_PATH = 'C:/Users/yadav/.gemini/antigravity/brain/126b9399-9775-4cb3-933e-04172bef2f60/uploaded_media_1770319469757.png';

const runTest = async () => {
    console.log("--- STARTING SEARCH TEST ---");

    // 1. Check if file exists
    if (!fs.existsSync(TEST_IMAGE_PATH)) {
        console.error("Test image not found at:", TEST_IMAGE_PATH);
        return;
    }

    try {
        // 2. Prepare Form Data
        const form = new FormData();
        form.append('eventId', EVENT_ID);
        form.append('images', fs.createReadStream(TEST_IMAGE_PATH));

        console.log(`Sending search request to ${API_URL}/photos/search...`);

        // 3. Send Request
        const response = await axios.post(`${API_URL}/photos/search`, form, {
            headers: {
                ...form.getHeaders()
            }
        });

        console.log("\n--- RESPONSE ---");
        console.log("Status:", response.status);
        if (Array.isArray(response.data)) {
            console.log(`Success! Found ${response.data.length} matches.`);
            if (response.data.length > 0) {
                console.log("First match:", response.data[0]);
            }
        } else {
            console.log("Response Data:", response.data);
        }

    } catch (error) {
        console.error("\n--- ERROR ---");
        if (error.response) {
            console.error("Server Error:", error.response.status);
            console.error("Data:", error.response.data);
        } else {
            console.error("Error:", error.message);
        }
    }
};

runTest();
