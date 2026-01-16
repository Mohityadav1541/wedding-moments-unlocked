const eventId = '696a42244c2a844f930b695e'; // manoj weds jyoti

// Vercel hosted API candidate
const candidates = [
    "https://wedding-moments-unlocked.vercel.app/api",
    "https://wedding-moments-unlocked-backend.vercel.app/api"
];

const probe = async () => {
    console.log(`Probing API for Event ID: ${eventId}\n`);

    for (const baseUrl of candidates) {
        const url = `${baseUrl}/events/public/${eventId}`;
        try {
            console.log(`Trying: ${url} ...`);
            const res = await fetch(url, { signal: AbortSignal.timeout(5000) });

            if (res.ok) {
                const data = await res.json();
                console.log(`✅ SUCCESS! Found API at: ${baseUrl}`);
                console.log(`Response Status: ${res.status}`);
                console.log(`Event Name: ${data.name}`);
                console.log(`Photo Count Field: ${data.photoCount}`);

                if (data.photoCount === undefined) {
                    console.log("❌ ISSUE: 'photoCount' field is MISSING in response!");
                } else {
                    console.log(`✅ 'photoCount' is present: ${data.photoCount}`);
                }
                return; // Stop after finding the working API
            } else {
                console.log(`❌ Failed: ${res.status} ${res.statusText}`);
            }
        } catch (err) {
            console.log(`❌ Error: ${err.message}`);
        }
        console.log('---');
    }
    console.log("\nCould not find working API URL.");
};

probe();
