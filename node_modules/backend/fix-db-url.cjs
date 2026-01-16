const fs = require('fs');
const path = require('path');
// We need to handle dotenv manually if not installed, but it usually is. 
// However, since require might fail if dotenv is strictly ESM? No, dotenv supports both.
// But to be safe, I'll just read the file directly line by line since it's a simple replace.

const envPath = path.join(__dirname, '.env');

try {
    let fileContent = fs.readFileSync(envPath, 'utf8');

    // Check if we need to fix it
    if (fileContent.includes('mongodb+srv://')) {
        console.log("Found SRV string. Fixing...");

        // Strategy: We don't parse. We just replace the string literal components.
        // Replace 'mongodb+srv://' -> 'mongodb://'
        let newContent = fileContent.replace('mongodb+srv://', 'mongodb://');

        // Replace hostname
        const oldHost = 'cluster0.y8mhlfw.mongodb.net';
        const newHost = 'ac-htepsw9-shard-00-00.y8mhlfw.mongodb.net:27017,ac-htepsw9-shard-00-02.y8mhlfw.mongodb.net:27017';

        newContent = newContent.replace(oldHost, newHost);

        // Add params if missing
        if (!newContent.includes('authSource=admin')) {
            // We need to be careful where to append.
            // Usually it ends with ?parameters...
            // regex to find the line ending
            // Actually, let's just append parameters.
            // If ? exists, use &
            // But simple replace is risky if there are multiple lines.
            // Let's assume the standard format from Atlas.
        }

        // Safer way: Append parameters to the connection string
        // The previous script was better at logic but worse at module support.
        // Let's rely on the string replacement being robust enough.
        // Atlas strings usually end with 'majority'
        if (newContent.includes('w=majority')) {
            if (!newContent.includes('ssl=true')) {
                newContent = newContent.replace('w=majority', 'w=majority&ssl=true&authSource=admin');
            }
        }

        fs.writeFileSync(envPath, newContent);
        console.log("✅ Fixed .env file!");
    } else {
        console.log("⚠️ No 'mongodb+srv://' found. Already fixed?");
    }

} catch (e) {
    console.error("Error:", e.message);
}
