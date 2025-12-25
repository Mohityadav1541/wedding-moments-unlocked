import Photo from '../models/Photo.js';
import Event from '../models/Event.js';
import { cloudinary } from '../config/cloudinary.js';
import { getFaceDescriptor, getAllFaceDescriptors, isMatch } from '../services/faceService.js';

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
    const { eventId } = req.body;
    let url = req.body.url;

    // Local file from multer
    if (req.file) {
        url = req.file.path;
    }

    if (!url) {
        return res.status(400).json({ message: 'No image provided' });
    }

    try {
        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        // Authorization check
        if (event.user.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // --- AI PROCESS START ---
        // Compute ALL face descriptors (detects multiple people)
        const descriptors = await getAllFaceDescriptors(url);
        // --- AI PROCESS END ---

        const photo = new Photo({
            event: eventId,
            url,
            faceDescriptors: descriptors || []
        });

        const createdPhoto = await photo.save();
        res.status(201).json(createdPhoto);
    } catch (error) {
        console.error("Add Photo Error:", error);
        res.status(400).json({ message: 'Invalid data or AI processing failed' });
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
        // 1. Compute descriptor for Selfie (Single face expected)
        const selfieDescriptor = await getFaceDescriptor(selfieUrl);

        if (!selfieDescriptor) {
            return res.status(200).json({
                message: 'No face detected in selfie. Please try again with a clear photo.',
                matches: []
            });
        }

        // 2. Fetch all photos for this event that HAVE descriptors
        // Optimization: We could use MongoDB vector search if available, but for now JS filter is fine for <1000 photos
        const eventPhotos = await Photo.find({
            event: eventId,
            $expr: { $gt: [{ $size: "$faceDescriptors" }, 0] }
        });

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

            let downloadUrl = photo.url;
            if (photo.url.includes('/upload/')) {
                const parts = photo.url.split('/upload/');
                const transformation = 'l_text:Arial_60_bold:Wedding%20AI,g_south_east,co_white,o_60';
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
