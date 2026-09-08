const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.join(__dirname, '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

if (envConfig.MONGO_URI) {
    let uri = envConfig.MONGO_URI;
    console.log("Original URI found (hidden).");

    // 1. Remove '+srv'
    uri = uri.replace('mongodb+srv://', 'mongodb://');

    // 2. Replace hostname with resolved shards
    // From: cluster0.y8mhlfw.mongodb.net
    // To: ac-htepsw9-shard-00-00.y8mhlfw.mongodb.net:27017,ac-htepsw9-shard-00-02.y8mhlfw.mongodb.net:27017
    const oldHost = 'cluster0.y8mhlfw.mongodb.net';
    const newHost = 'ac-htepsw9-shard-00-00.y8mhlfw.mongodb.net:27017,ac-htepsw9-shard-00-02.y8mhlfw.mongodb.net:27017';

    if (uri.includes(oldHost)) {
        uri = uri.replace(oldHost, newHost);

        // 3. Ensure params (ssl=true is needed for direct connection usually)
        if (!uri.includes('ssl=true')) {
            if (uri.includes('?')) {
                uri += '&ssl=true&authSource=admin';
            } else {
                uri += '?ssl=true&authSource=admin';
            }
        }

        // Update the file content
        let fileContent = fs.readFileSync(envPath, 'utf8');
        // Simple regex replace to preserve comments/formatting
        // We look for the exact line starting with MONGO_URI
        const regex = /^MONGO_URI=.*$/m;
        fileContent = fileContent.replace(regex, `MONGO_URI=${uri}`);

        fs.writeFileSync(envPath, fileContent);
        console.log("✅ Successfully updated MONGO_URI to use Direct Connection.");
    } else {
        console.log("⚠️ Hostname not found in URI. Already fixed?");
    }
} else {
    console.log("❌ MONGO_URI not found in .env");
}
