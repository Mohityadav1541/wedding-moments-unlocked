import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.HUGGING_FACE_API_URL;
console.log(`Target: ${BASE_URL}`);

async function probe(method, path) {
    try {
        const url = `${BASE_URL}${path}`;
        const res = await axios({
            method,
            url,
            timeout: 5000,
            data: {} // Empty body
        });
        console.log(`✅ FOUND: ${method} ${path} -> Status ${res.status}`);
        if (res.data) console.log(`   Response: ${JSON.stringify(res.data).slice(0, 50)}...`);
    } catch (err) {
        if (err.response) {
            console.log(`❌ ${method} ${path} -> ${err.response.status} (${err.response.statusText})`);
            if (err.response.status === 405) console.log(`   !!! ROUTE EXISTS (Wrong Method) !!!`);
            if (err.response.status === 422 || err.response.status === 400) console.log(`   !!! ROUTE EXISTS (Needs Data) !!!`);
        } else {
            console.log(`❌ ${method} ${path} -> Error: ${err.message}`);
        }
    }
}

async function run() {
    console.log("--- STARTING PROBE 2 ---");
    // Test POST on Root
    await probe('POST', '/');

    // Test /api/analyze
    await probe('POST', '/api/analyze');

    // Test /analyze-url (seen in the original file I viewed way back in step 10!!)
    await probe('POST', '/analyze-url');

    // Wait... in step 10 `test-ai.js` had:
    // const response = await axios.post(`${URL}/analyze-url`, ...
    // BUT `externalAiService.js` had `/analyze`.
    // There is a mismatch!
    console.log("--- FINISHED ---");
}

run();
