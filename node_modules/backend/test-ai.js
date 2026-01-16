import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const URL = process.env.HUGGING_FACE_API_URL;
console.log("Testing AI URL:", URL);

if (!URL) {
    console.error("ERROR: HUGGING_FACE_API_URL is missing in .env");
    process.exit(1);
}

// A known image with a face (Tom Cruise) - reliable for testing
const TEST_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Tom_Cruise_in_2019.jpg/220px-Tom_Cruise_in_2019.jpg";

async function testConnection() {
    try {
        console.log("Sending request to AI Service...");
        console.log(`Analyzing Image: ${TEST_IMAGE}`);

        const response = await axios.post(`${URL}/analyze-url`, {
            url: TEST_IMAGE
        });

        console.log("---------------------------------------------------");
        console.log("STATUS: SUCCESS ✅");
        console.log("Descriptors Found:", response.data.descriptors ? response.data.descriptors.length : 0);
        console.log("First Descriptor Sample:", response.data.descriptors[0]?.slice(0, 5));
        console.log("---------------------------------------------------");

    } catch (error) {
        console.log("---------------------------------------------------");
        console.log("STATUS: FAILED ❌");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data:`, error.response.data);
        } else {
            console.error(error.message);
        }
        console.log("---------------------------------------------------");
    }
}

testConnection();
