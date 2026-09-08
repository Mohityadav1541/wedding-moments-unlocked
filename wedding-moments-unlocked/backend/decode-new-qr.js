import { Jimp } from "jimp";
import jsQR from "jsqr";
import fs from "fs";

// Path to the NEW uploaded image
const imagePath = "C:/Users/yadav/.gemini/antigravity/brain/347b8059-2cb8-4cd3-b628-9da04393cd26/uploaded_media_1770133026037.png";

const decodeQR = async () => {
    try {
        const image = await Jimp.read(imagePath);
        const { data, width, height } = image.bitmap;
        const code = jsQR(data, width, height);

        if (code) {
            console.log("QR Code Content:", code.data);
            // Extract ID if it looks like a URL
            // e.g. https://domain.com/event/ID
            const parts = code.data.split('/');
            const id = parts[parts.length - 1];
            console.log("Extracted ID:", id);
        } else {
            console.log("No QR code found.");
        }
    } catch (error) {
        console.error("Error decoding QR:", error);
    }
};

decodeQR();
