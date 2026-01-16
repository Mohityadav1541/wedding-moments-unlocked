import fetch from 'node-fetch';

const urls = [
    "https://mohit00000-wedding-moments-ai.hf.space",
    "https://mohit00000-wedding-moments-ai-7d377c7.hf.space",
    "https://mohit00000-wedding-moments-ai.hf.space/analyze",
    "https://mohit00000-wedding-moments-ai.hf.space/predict"
];

const check = async () => {
    for (const url of urls) {
        try {
            console.log(`Checking: ${url}`);
            const res = await fetch(url, { method: 'GET', timeout: 5000 });
            console.log(`Status: ${res.status} ${res.statusText}`);
            if (res.ok) {
                const text = await res.text();
                console.log(`Body: ${text.substring(0, 100)}`);
            }
        } catch (e) {
            console.log(`Error: ${e.message}`);
        }
        console.log('---');
    }
};

check();
