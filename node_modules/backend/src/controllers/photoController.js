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
            url,
            faceDescriptors: faceDescriptors,
            aiProcessed: true
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
                let result;
                try {
                    // Upload to Cloudinary to get a URL for the AI Service
                    result = await new Promise((resolve, reject) => {
                        const uploadStream = cloudinary.uploader.upload_stream(
                            {
                                folder: 'temp_search',
                                // Transformation to save space/bandwidth - resize BEFORE storing in Cloudinary
                                transformation: [{ width: 1000, crop: "limit", quality: "auto" }]
                            },
                            (error, result) => {
                                if (error) reject(error);
                                else resolve(result);
                            }
                        );
                        const stream = Readable.from(file.buffer);
                        stream.pipe(uploadStream);
                    });

                    console.log(`[Search] Temp Upload: ${result.secure_url}`);

                    const descriptors = await getAllFaceDescriptors(result.secure_url);
                    if (descriptors && descriptors.length > 0) {
                        console.log(`[Search] Found ${descriptors.length} face(s) in selfie.`);
                        userDescriptors.push(...descriptors);
                    }

                } catch (err) {
                    console.error("[Search] Processing Failed for file:", err);
                } finally {
                    // ALWAYS cleanup temp file
                    if (result && result.public_id) {
                        await cloudinary.uploader.destroy(result.public_id).catch(e => console.error("Cleanup warning:", e));
                        console.log(`[Search] Cleaned up temp file: ${result.public_id}`);
                    }
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

        // Populate User to get the Studio Name
        const event = await Event.findById(eventId).populate('user');
        const eventFeatures = event ? event.features : { watermarkEnabled: true, watermarkText: '' };

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
        // Using centralized MATCH_THRESHOLD from externalAiService (0.45 for Emergency Mode)
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
            // Text Priority: 1. Event Custom Text (if set) -> 2. User Studio Name -> 3. User Name -> 4. Default
            const shouldWatermark = eventFeatures.watermarkEnabled;

            if (shouldWatermark) {
                // Determine text priority:
                // 1. Custom Event Text (ONLY if it's not the default generic text)
                // 2. Studio Name (Sanwaliya Photo Studio)
                // 3. User Name
                // 4. Default

                let watermarkText = eventFeatures.watermarkText;
                const isGeneric = !watermarkText || watermarkText === 'Wedding Moments' || watermarkText === 'Wedding Moments AI';

                if (isGeneric && event.user && event.user.studioName) {
                    watermarkText = event.user.studioName;
                } else if (isGeneric && event.user && event.user.name) {
                    watermarkText = event.user.name;
                }

                if (!watermarkText || watermarkText === 'Wedding Moments') watermarkText = 'Wedding Moments AI';

                const text = encodeURIComponent(watermarkText);
                // SAFE SYNTAX: White Text with Black Border (Stroke)
                // Position: 'g_south_east' (Bottom Right), with padding (x_30, y_30)
                transformation += `/l_text:Arial_60_bold:${text},g_south_east,x_30,y_30,co_white,bo_4px_solid_black,fl_layer_apply`;
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

        // Delete from Cloudinary with concurrency limit (Batch size is controlled by Frontend, but we add safety here)
        // Promise.all is faster than sequential await
        const deletePromises = photos.map(async (photo) => {
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
        });

        await Promise.all(deletePromises);

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

// @desc    Re-scan photos with missing AI data (Recovery Tool)
// @route   POST /api/photos/rescan
// @access  Private/Admin
export const rescanPhotos = async (req, res) => {
    try {
        const { eventId, force } = req.body;
        console.log(`[Rescan] Request for event: ${eventId} (Force: ${force})`);

        const query = { event: eventId };

        // If NOT forced, only scan missing ones. 
        // If FORCE is true, we scan EVERYTHING (dangerous/expensive but needed for upgrades)
        if (!force) {
            // FIX: Prevent infinite loop on 0-face photos
            // Only scan if 'aiProcessed' is false or missing (legacy photos)
            query.$or = [
                { aiProcessed: false },
                { aiProcessed: { $exists: false } }
            ];
        }

        // Limit to 5 photos per request to avoid Vercel 10s timeout (since retries take time now)
        // SORT by updatedAt (Oldest first) to avoid infinite loops when using force=true
        const photosToScan = await Photo.find(query).sort({ updatedAt: 1 }).limit(5);
        console.log(`[Rescan] Processing batch of ${photosToScan.length} photos...`);

        // Count remaining total for the user info (This is tricky with force=true, but acceptable approximation)
        const contentRemaining = await Photo.countDocuments(query);

        if (photosToScan.length === 0) {
            return res.json({ message: 'All photos are healthy! No re-scan needed.', processed: 0, success: 0, remaining: 0 });
        }

        let successCount = 0;
        let processedCount = 0;

        for (const photo of photosToScan) {
            processedCount++;
            try {
                // Use existing URL - make sure it is accessible
                console.log(`[Rescan] Processing ${processedCount}/${photosToScan.length}: ${photo.url}`);
                const descriptors = await getAllFaceDescriptors(photo.url);

                photo.faceDescriptors = descriptors;
                photo.aiProcessed = true; // MARK AS PROCESSED
                await photo.save();
                successCount++;
                console.log(`[Rescan] Success for ${photo._id}`);
            } else {
                // Even if 0 faces, mark as processed so we don't loop forever
                photo.aiProcessed = true;
                await photo.save();
                console.warn(`[Rescan] No faces found for ${photo._id} (Marked as processed)`);
            }

            // Small delay to be nice to the API
            await new Promise(r => setTimeout(r, 500));

        } catch (err) {
            console.error(`[Rescan] Failed for ${photo._id}:`, err.message);
        }
    }

        res.json({
        message: `Processed batch of ${processedCount}. Updated ${successCount}. (${contentRemaining - processedCount} remaining - Click Fix again)`,
        processed: processedCount,
        success: successCount,
        remaining: contentRemaining - processedCount
    });

} catch (error) {
    console.error("Rescan Error:", error);
    res.status(500).json({ message: 'Server Error during rescan' });
}
};
