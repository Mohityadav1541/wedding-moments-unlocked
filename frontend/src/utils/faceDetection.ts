import * as faceapi from '@vladmandic/face-api';

// Use a public CDN for models to avoid local heavy files
const MODEL_URL = 'https://vladmandic.github.io/face-api/model/';

let modelsLoaded = false;

/**
 * Loads the necessary face-api models.
 * Uses the Tiny Face Detector for speed and low resource usage.
 */
export const loadFaceApiModels = async () => {
    if (modelsLoaded) return;
    try {
        console.log("Loading FaceAPI models...");
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        // Landmark and recognition nets needed if we were doing matching here, 
        // but for just detection/cropping, we might only need detector.
        // However, alignment usually helps, so loading landmarks is good.
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        modelsLoaded = true;
        console.log("FaceAPI models loaded.");
    } catch (error) {
        console.error("Error loading FaceAPI models:", error);
        throw new Error("Failed to load AI models");
    }
};

/**
 * Detects the single largest face in the image and returns a cropped Blob.
 * If no face is found, throws an error.
 * @param imageElementOrUrl The image source (HTMLImageElement or URL string)
 * @returns Promise<Blob> The cropped face image as a Blob (JPEG)
 */
export const detectAndCropFace = async (imageInput: HTMLImageElement | string): Promise<Blob> => {
    if (!modelsLoaded) await loadFaceApiModels();

    let img: HTMLImageElement;

    if (typeof imageInput === 'string') {
        img = new Image();
        img.src = imageInput;
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });
    } else {
        img = imageInput;
    }

    // Detect single face
    // useTinyFaceDetector: true is faster
    const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();

    if (!detection) {
        throw new Error("No face detected. Please try a clearer photo.");
    }

    // Get the bounding box
    const { box } = detection.detection;

    // Create a canvas to crop
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Add some padding to the crop (optional, to include hair/chin)
    // But for embedding, tighter is sometimes better. Let's do 10% padding.
    const padding = 0.1;
    const x = Math.max(0, box.x - (box.width * padding));
    const y = Math.max(0, box.y - (box.height * padding)); // Less padding on top?
    const width = Math.min(img.width - x, box.width * (1 + padding * 2));
    const height = Math.min(img.height - y, box.height * (1 + padding * 2));

    // We want to standardize the output size (e.g., 200x200 or 160x160)
    // This helps reduce payload size.
    const OUTPUT_SIZE = 160;
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;

    if (!ctx) throw new Error("Could not create canvas context");

    // Draw the cropped area resized to OUTPUT_SIZE
    ctx.drawImage(img, x, y, width, height, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    // Convert to Blob (JPEG 80% quality)
    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error("Canvas to Blob failed"));
            }
        }, 'image/jpeg', 0.8);
    });
};
