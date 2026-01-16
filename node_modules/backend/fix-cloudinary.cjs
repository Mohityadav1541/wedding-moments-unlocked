const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const newCloudName = 'dwjzce0ny';

try {
    let fileContent = fs.readFileSync(envPath, 'utf8');

    // Regex to find CLOUDINARY_CLOUD_NAME=...
    const regex = /^CLOUDINARY_CLOUD_NAME=.*$/m;

    if (regex.test(fileContent)) {
        console.log("Found CLOUDINARY_CLOUD_NAME. Updating...");
        const newContent = fileContent.replace(regex, `CLOUDINARY_CLOUD_NAME=${newCloudName}`);
        fs.writeFileSync(envPath, newContent);
        console.log(`✅ Updated Cloud Name to: ${newCloudName}`);
    } else {
        console.log("⚠️ CLOUDINARY_CLOUD_NAME not found in .env. Appending...");
        fs.appendFileSync(envPath, `\nCLOUDINARY_CLOUD_NAME=${newCloudName}`);
        console.log(`✅ Appended Cloud Name: ${newCloudName}`);
    }

} catch (e) {
    console.error("Error:", e.message);
}
