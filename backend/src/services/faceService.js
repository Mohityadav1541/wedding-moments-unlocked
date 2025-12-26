import * as faceapi from '@vladmandic/face-api';
import canvas from 'canvas';
const { Canvas, Image, ImageData } = canvas;

// Monkey patch face-api to use node-canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let modelsLoaded = false;

// Initialize models
const loadModels = async () => {
    if (modelsLoaded) return;
    try {
        console.log("Loading FaceAPI models...");
        // Load from Vlad's public repo to avoid storing large binaries locally
        const modelUrl = 'https://vladmandic.github.io/face-api/model/';

        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl),
            faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl),
            faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl)
        ]);

        modelsLoaded = true;
        console.log("FaceAPI models loaded successfully (Tiny Face Detector).");
    } catch (error) {
        console.error("Failed to load FaceAPI models:", error);
    }
};

// Compute descriptors for ALL faces in an image
export const getAllFaceDescriptors = async (imageUrl) => {
    try {
        if (!modelsLoaded) await loadModels();

        const img = await canvas.loadImage(imageUrl);

        // Detect ALL faces using Tiny Face Detector
        const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptors();

        if (!detections || detections.length === 0) {
            return []; // No faces found
        }

        // Return array of arrays
        return detections.map(d => Array.from(d.descriptor));
    } catch (error) {
        console.error("Error processing faces:", error);
        return [];
    }
};

// Compute descriptor for an image URL or Path (Legacy/Single)
export const getFaceDescriptor = async (imageUrl) => {
    try {
        if (!modelsLoaded) await loadModels();

        // Load image using canvas
        const img = await canvas.loadImage(imageUrl);

        // Detect face with highest confidence using Tiny Face Detector
        const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detection) {
            return null; // No face found
        }

        // Return array of numbers (descriptor)
        return Array.from(detection.descriptor);
    } catch (error) {
        console.error("Error processing face:", error);
        return null; // Fail gracefully
    }
};

// Compare two descriptors (Euclidean distance)
export const isMatch = (descriptor1, descriptor2, threshold = 0.5) => {
    const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
    return distance < threshold;
};
