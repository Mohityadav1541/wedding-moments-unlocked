import * as faceapi from 'face-api.js';

// Load models from public/models
const MODEL_URL = '/models';

export const loadModels = async () => {
    try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        console.log("FaceAPI models loaded");
    } catch (error) {
        console.error("Error loading FaceAPI models:", error);
    }
};

export const detectAndCropFace = async (imageFile: File): Promise<Blob | null> => {
    // 1. Create an HTMLImageElement from the file
    const img = await faceapi.bufferToImage(imageFile);

    // 2. Detect all faces
    // ssdMobilenetv1 is accurate and reasonably fast
    const detections = await faceapi.detectAllFaces(img).withFaceLandmarks();

    if (!detections || detections.length === 0) {
        console.warn("No faces detected");
        return null;
    }

    // 3. Find the largest face (assuming the user is the main subject)
    let largestFace = detections[0];
    let maxArea = 0;

    for (const d of detections) {
        const area = d.detection.box.width * d.detection.box.height;
        if (area > maxArea) {
            maxArea = area;
            largestFace = d;
        }
    }

    // 4. Crop the face with some padding
    const box = largestFace.detection.box;
    // Add 20% padding around the face for better context for the recognition model
    const padding = 0.2;

    // Safely calculate coordinates
    const x = Math.max(0, box.x - (box.width * padding));
    const y = Math.max(0, box.y - (box.height * padding * 1.5)); // More top padding for hair
    const width = Math.min(img.width - x, box.width * (1 + padding * 2));
    const height = Math.min(img.height - y, box.height * (1 + padding * 2));

    // 5. Draw to canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

    // 6. Convert to Blob (JPEG 160x160 or similar small size)
    // We want a high-quality crop but small file size. 
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/jpeg', 0.95);
    });
};
