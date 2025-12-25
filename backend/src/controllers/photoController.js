import Photo from '../models/Photo.js';
import Event from '../models/Event.js';
import { cloudinary } from '../config/cloudinary.js';

// @desc    Get photos for an event
// @route   GET /api/photos/:eventId
// @access  Private/Admin (or Public depending on logic)
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

    if (req.file) {
        url = req.file.path.replace(/\\/g, "/"); // Normalize path for Windows
    }

    if (!url) {
        return res.status(400).json({ message: 'No image provided' });
    }

    try {
        // Check if event exists and user owns it
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        if (event.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const photo = new Photo({
            event: eventId,
            url,
        });

        const createdPhoto = await photo.save();
        res.status(201).json(createdPhoto);
    } catch (error) {
        console.error("Add Photo Error:", error);
        res.status(400).json({ message: 'Invalid data' });
    }
};

// @desc    Delete photo
// @route   DELETE /api/photos/:id
// @access  Private/Admin
export const deletePhoto = async (req, res) => {
    try {
        const photo = await Photo.findById(req.params.id);

        if (photo) {
            // Check authorization: User must own the specific EVENT associated with the photo?
            // Or easier: find event, check event.user == req.user OR req.user.role == superadmin
            // BUT, Photo model references Event.
            // Let's assume for now if they can find the photo they can verify ownership via Event populate or separate query.

            // To be safe, verify ownership
            const event = await Event.findById(photo.event);
            if (!event) {
                // If event doesn't exist, maybe orphan photo, allow superadmin?
                if (req.user.role !== 'superadmin') {
                    return res.status(404).json({ message: 'Event not found for this photo' });
                }
            } else {
                if (event.user.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
                    return res.status(401).json({ message: 'Not authorized' });
                }
            }

            // Remove from Cloudinary
            if (photo.url) {
                try {
                    // Extract public_id from URL
                    // Example: https://res.cloudinary.com/.../wedding-ai/e4a1d...jpg
                    const urlParts = photo.url.split('/');
                    const filenameWithExt = urlParts[urlParts.length - 1]; // e4a1d...jpg
                    const folderName = urlParts[urlParts.length - 2]; // wedding-ai
                    // Use folderName from config or extract from URL? Extracting is safer if we reuse logic.
                    // Assuming standard Cloudinary URL structure.
                    // Note: If URL is not Cloudinary (legacy local), skip.

                    if (photo.url.includes('cloudinary')) {
                        const publicId = `${folderName}/${filenameWithExt.split('.')[0]}`;
                        await cloudinary.uploader.destroy(publicId);
                    }
                } catch (err) {
                    console.error("Cloudinary Delete Error:", err);
                    // Continue to delete from DB even if Cloudinary fails (orphan file vs metadata consistency)
                }
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
