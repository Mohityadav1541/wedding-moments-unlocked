import Photo from '../models/Photo.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { cloudinary } from '../config/cloudinary.js';
import { getFaceDescriptor, getAllFaceDescriptors, isMatch, getCosineSimilarity, isValidDescriptor, MATCH_THRESHOLD } from '../services/externalAiService.js';
import { Readable } from 'stream';

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

        // --- AI PROCESSING (Synchronous for Vercel) ---
        // We must await this because Vercel freezes the function immediately after res.json()
        let faceDescriptors = [];
        try {
            console.log(`[Photo] Starting AI processing for URL: ${url}`);
            const descriptors = await getAllFaceDescriptors(url);
            console.log(`[Photo] AI Processing complete. Descriptors found: ${descriptors ? descriptors.length : 0}`);
            if (descriptors) {
                faceDescriptors = descriptors;
            }
        } catch (aiError) {
            console.error("[Photo] AI Service Failed:", aiError.message);
            // We continue even if AI fails, but user should know? 
            // For now, we save the photo anyway so they don't lose the upload.
        }

        const photo = new Photo({
            event: eventId,
            url,
            faceDescriptors: faceDescriptors
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

    // Handle multiple files (Multer array) or fallback to single
    const files = req.files || (req.file ? [req.file] : []);

    if (files.length === 0 || !eventId) {
        return res.status(400).json({ message: 'At least one selfie and Event ID are required' });
    }

    try {
        // 1. Compute descriptors for ALL uploaded selfies
        const userDescriptors = [];

        console.log(`[Search] Processing ${files.length} selfie(s)...`);

        for (const file of files) {
            // Note: file.buffer is available because we use memoryStorage now
            if (file.buffer) {
                try {
                    // Upload to Cloudinary to get a URL for the AI Service
                    const uploadPromise = new Promise((resolve, reject) => {
                        const uploadStream = cloudinary.uploader.upload_stream(
                            { folder: 'temp_search' },
                            (error, result) => {
                                if (error) reject(error);
                                else resolve(result);
                            }
                        );
                        const stream = Readable.from(file.buffer);
                        stream.pipe(uploadStream);
                    });

                    const result = await uploadPromise;
                    console.log(`[Search] Temp Upload: ${result.secure_url}`);

                    const descriptors = await getAllFaceDescriptors(result.secure_url);
                    if (descriptors && descriptors.length > 0) {
                        console.log(`[Search] Found ${descriptors.length} face(s) in selfie.`);
                        userDescriptors.push(...descriptors);
                    }

                    // Cleanup (Async, don't await)
                    cloudinary.uploader.destroy(result.public_id).catch(err => console.error("Cleanup failed", err));

                } catch (err) {
                    console.error("[Search] Temp Upload Failed:", err);
                }
            }
        }

        console.log(`[Search] Valid Face Descriptors found: ${userDescriptors.length}`);

        if (userDescriptors.length === 0) {
            return res.status(200).json({
                message: 'No face detected in any of the uploaded selfies. Please try clear, front-facing photos.',
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

        // 3. Match faces with Cosine Similarity
        // Calculate best match similarity for each photo
        const potentialMatches = eventPhotos.map(photo => {
            let maxSimilarity = -1.0; // Start with lowest possible similarity

            // Check all faces in this photo against all user selfies
            if (photo.faceDescriptors) {
                for (const dbDesc of photo.faceDescriptors) {
                    // NEW: Validate DB Descriptor before using it (Fix for "All Match" bug)
                    if (!isValidDescriptor(dbDesc)) continue;

                    for (const userDesc of userDescriptors) {
                        const sim = getCosineSimilarity(userDesc, dbDesc);
                        if (sim > maxSimilarity) {
                            maxSimilarity = sim;
                        }
                    }
                }
            }
            return { photo, maxSimilarity };
        });

        // Filter by threshold
        // Using centralized MATCH_THRESHOLD from externalAiService (0.6)
        const matches = potentialMatches.filter(item => {
            if (item.maxSimilarity > MATCH_THRESHOLD) {
                return true;
            }
            // Optional: Log rejected near-matches for debugging
            if (item.maxSimilarity > 0.4) {
                console.log(`[Search] Rejected match: Sim ${item.maxSimilarity.toFixed(4)} < Threshold ${MATCH_THRESHOLD}`);
            }
            return false;
        });

        // Sort by best match (highest similarity)
        matches.sort((a, b) => b.maxSimilarity - a.maxSimilarity);

        console.log(`[Search] Matches found: ${matches.length}`);

        // 4. Transform matches for display (Add Smart Watermark logic)
        const results = matches.map(({ photo, maxSimilarity }) => {
            // Base Transformation: Always resize to 1080px width (High Quality Mobile)
            let transformation = 'w_1080,c_limit,q_auto,f_auto';

            // Watermark Logic: Always apply watermark with photographer's business name
            // Text comes from event.features.watermarkText (set per event)
            const shouldWatermark = eventFeatures.watermarkEnabled;

            if (shouldWatermark) {
                const text = encodeURIComponent(eventFeatures.watermarkText || 'Wedding Moments AI');
                transformation += `/l_text:Arial_60_bold:${text},g_south,y_50,co_white,o_90,b_rgb:00000050,fl_layer_apply`;
            }

            let downloadUrl = photo.url;

            if (photo.url.includes('/upload/')) {
                const parts = photo.url.split('/upload/');
                downloadUrl = `${parts[0]}/upload/${transformation}/${parts[1]}`;
            }

            // Calculate confidence score (Directly map similarity to %)
            // Sim 0.5 -> 50%, Sim 1.0 -> 100%
            const confidence = Math.max(0, Math.round(maxSimilarity * 100));

            return {
                _id: photo._id,
                url: photo.url,
                downloadUrl,
                confidence: confidence
            };
        });

        res.json(results);

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

// @desc    Reset AI Data (Clear Descriptors)
// @route   GET /api/photos/reset-ai-data
// @access  Public (Temporary for debugging)
export const resetAIData = async (req, res) => {
    try {
        const result = await Photo.updateMany({}, { $set: { faceDescriptors: [] } });
        console.log(`[Reset] Cleared descriptors for ${result.modifiedCount} photos.`);
        res.json({ message: `Success. Cleared descriptors for ${result.modifiedCount} photos. You can now re-upload to re-scan.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error resetting data' });
    }
};
