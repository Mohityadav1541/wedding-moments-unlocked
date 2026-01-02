import Photo from '../models/Photo.js';
import Event from '../models/Event.js';
import { cloudinary } from '../config/cloudinary.js';
import { getFaceDescriptor, getAllFaceDescriptors, isMatch } from '../services/externalAiService.js';

// @desc    Get photos for an event
// @route   GET /api/photos/:eventId
// @access  Private/Admin (Public for guest matching results technically)
export const getPhotosByEvent = async (req, res) => {
    try {
        const photos = await Photo.find({ event: req.params.eventId });
        res.json(photos);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add photo to event
// @route   POST /api/photos
// @access  Private/Admin
export const addPhoto = async (req, res) => {
    try {
        console.log("[Photo] Add Photo Request Received");
        const { eventId } = req.body;
        let url = req.body.url;

        // Local file from multer
        if (req.file) {
            console.log(`[Photo] File received from Multer: ${req.file.path}`);
            url = req.file.path;
        } else {
            console.log("[Photo] No file in req.file");
        }

        if (!url) {
            console.error("[Photo] No URL or File provided");
            return res.status(400).json({ message: 'No image provided' });
        }

        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            console.error(`[Photo] Event not found: ${eventId}`);
            return res.status(404).json({ message: 'Event not found' });
        }
        // Authorization check
        if (event.user.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
            console.error(`[Photo] Authorization failed. User: ${req.user._id}, Event Owner: ${event.user}`);
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Check Photo Limit (Optimization: do this before AI processing)
        const currentPhotoCount = await Photo.countDocuments({ event: eventId });
        const user = await User.findById(req.user._id);

        // Use user's limit or fallback to a reasonable default if not set
        const limit = user.photoLimit || 2000;
        console.log(`[Photo] Current Count: ${currentPhotoCount}, Limit: ${limit}`);

        if (req.user.role !== 'superadmin' && currentPhotoCount >= limit) {
            console.warn(`[Photo] Limit reached for user ${req.user._id}`);
            return res.status(403).json({ message: `Photo limit reached (${limit}). Upgrade your plan to upload more.` });
        }

        // --- AI PROCESS START ---
        // Compute ALL face descriptors (detects multiple people) using External Python API
        // This offloads heavy processing from our Node server
        console.log(`[Photo] Starting AI processing for: ${url}`);
        let descriptors = [];
        try {
            descriptors = await getAllFaceDescriptors(url);
            console.log(`[Photo] AI Processing complete. Descriptors found: ${descriptors ? descriptors.length : 0}`);
        } catch (aiError) {
            console.error("[Photo] AI Service Failed (Soft Fail):", aiError.message);
            // Proceed without descriptors - don't block upload
        }
        // --- AI PROCESS END ---

        const photo = new Photo({
            event: eventId,
            url,
            faceDescriptors: descriptors || []
        });

        const createdPhoto = await photo.save();
        console.log(`[Photo] Saved to DB: ${createdPhoto._id}`);
        res.status(201).json(createdPhoto);
    } catch (error) {
        console.error("Add Photo Error:", error);
        res.status(400).json({ message: error.message || 'Invalid data or AI processing failed' });
    }
};

// @desc    Search photos by face (Selfie)
// @route   POST /api/photos/search
// @access  Public
export const searchPhotos = async (req, res) => {
    const { eventId } = req.body;

    // Selfie can be a URL (if uploaded to cloudinary first) or a file path (if uploaded locally via multer)
    // Here we strictly expect 'image' file upload via middleware
    const selfieUrl = req.file ? req.file.path : null;

    if (!selfieUrl || !eventId) {
        return res.status(400).json({ message: 'Selfie image and Event ID are required' });
    }

    try {
        // 1. Compute descriptor for Selfie (Single face expected) - External API
        const selfieDescriptor = await getFaceDescriptor(selfieUrl);

        if (!selfieDescriptor) {
            return res.status(200).json({
                message: 'No face detected in selfie. Please try again with a clear photo.',
                matches: []
            });
        }

        // 2. Fetch all photos for this event that HAVE descriptors
        const eventPhotos = await Photo.find({
            event: eventId,
            $expr: { $gt: [{ $size: "$faceDescriptors" }, 0] }
        });

        const event = await Event.findById(eventId);
        const eventFeatures = event ? event.features : { watermarkEnabled: true, watermarkText: 'Wedding Moments' };

        // 3. Match faces (Check if selfie matches ANY face in the photo)
        const matches = eventPhotos.filter(photo => {
            // photo.faceDescriptors is array of arrays
            return photo.faceDescriptors.some(descriptor => {
                return isMatch(selfieDescriptor, descriptor);
            });
        });

        // 4. Transform matches for display (Add Watermark logic)
        // Assuming Cloudinary URLs
        const results = matches.map(photo => {
            // Apply generic studio watermark for download
            // Cloudinary transformation: overlay text "Wedding Moments"
            // Simple structure: insert transformation string before filename
            // Example: https://res.cloudinary.com/cloud/image/upload/v1234/folder/file.jpg
            // Target: https://res.cloudinary.com/cloud/image/upload/l_text:Arial_80_bold:Wedding%20AI,g_south_east,co_white,o_80/v1234/folder/file.jpg

            // Fetch event settings for watermark
            // We already have eventId, let's look up the event features
            // Optimization: In a real app, populate this earlier or cache it, 
            // but for now we fetch it inside the loop or mock it? 
            // Actually, we need to fetch the event once outside the loop.

            let downloadUrl = photo.url;

            // Check if watermark is enabled for this event
            // (Passed from top scope - we need to fetch event first)
            if (eventFeatures.watermarkEnabled && photo.url.includes('/upload/')) {
                const parts = photo.url.split('/upload/');
                // Encode text for Cloudinary URL (e.g. spaces to %20)
                const text = encodeURIComponent(eventFeatures.watermarkText || 'Wedding Moments AI');
                // Cloudinary transformation: overlay text, bottom right, white, opacity 60%
                const transformation = `l_text:Arial_80_bold:${text},g_center,co_white,o_60`;
                downloadUrl = `${parts[0]}/upload/${transformation}/${parts[1]}`;
            }

            return {
                _id: photo._id,
                url: photo.url, // Preview original (or maybe low res?)
                downloadUrl,    // Watermarked
                confidence: 90 // Placeholder or calculate real confidence
            };
        });

        res.json(results);

        // Optional: Delete the temp selfie from Cloudinary to save space?
        // if (req.file.filename) cloudinary.uploader.destroy(req.file.filename);

    } catch (error) {
        console.error("Search Photos Error:", error);
        res.status(500).json({ message: 'Server Error during face search' });
    }
};

// @desc    Delete photo
// @route   DELETE /api/photos/:id
// @access  Private/Admin
export const deletePhoto = async (req, res) => {
    try {
        const photo = await Photo.findById(req.params.id);

        if (photo) {
            const event = await Event.findById(photo.event);
            if (!event) {
                if (req.user.role !== 'superadmin') return res.status(404).json({ message: 'Event not found' });
            } else {
                if (event.user.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
                    return res.status(401).json({ message: 'Not authorized' });
                }
            }

            // Remove from Cloudinary
            if (photo.url && photo.url.includes('cloudinary')) {
                try {
                    const urlParts = photo.url.split('/');
                    const filenameWithExt = urlParts[urlParts.length - 1];
                    const folderName = urlParts[urlParts.length - 2];
                    const publicId = `${folderName}/${filenameWithExt.split('.')[0]}`;
                    await cloudinary.uploader.destroy(publicId);
                } catch (err) { }
            }

            await photo.deleteOne();
            res.json({ message: 'Photo removed' });
        } else {
            res.status(404).json({ message: 'Photo not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete multiple photos
// @route   POST /api/photos/delete-batch
// @access  Private/Admin
export const deletePhotos = async (req, res) => {
    const { photoIds } = req.body;

    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
        return res.status(400).json({ message: 'No photo IDs provided' });
    }

    try {
        // Find photos to ensure they exist and user is authorized
        const photos = await Photo.find({ _id: { $in: photoIds } });

        if (photos.length === 0) {
            return res.status(404).json({ message: 'No photos found' });
        }

        // Check authorization (assuming all photos belong to same event/user context for simplicity, 
        // or check one by one. Here we check the first one as a sanity check)
        const event = await Event.findById(photos[0].event);
        if (event) {
            if (event.user.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
                return res.status(401).json({ message: 'Not authorized' });
            }
        }

        // Delete from Cloudinary
        for (const photo of photos) {
            if (photo.url && photo.url.includes('cloudinary')) {
                try {
                    const urlParts = photo.url.split('/');
                    const filenameWithExt = urlParts[urlParts.length - 1];
                    const folderName = urlParts[urlParts.length - 2];
                    const publicId = `${folderName}/${filenameWithExt.split('.')[0]}`;
                    await cloudinary.uploader.destroy(publicId);
                } catch (err) {
                    console.error(`Failed to delete from Cloudinary: ${photo._id}`, err);
                }
            }
        }

        // Delete from DB
        await Photo.deleteMany({ _id: { $in: photoIds } });

        res.json({ message: `${photos.length} photos deleted successfully` });
    } catch (error) {
        console.error("Batch Delete Error:", error);
        res.status(500).json({ message: 'Server Error during batch delete' });
    }
};
