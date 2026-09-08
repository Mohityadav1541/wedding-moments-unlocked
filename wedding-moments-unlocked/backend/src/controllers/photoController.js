import Photo from '../models/Photo.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { uploadImage, deleteImage } from '../services/r2StorageService.js';
import { getAllFaceDescriptors, isValidDescriptor, POSSIBLE_MATCH_THRESHOLD, HIGH_CONFIDENCE_THRESHOLD } from '../services/externalAiService.js';

// @desc    Get photos for an event
// @route   GET /api/photos/:eventId
// @access  Private/Admin (Public for guest matching results technically)
export const getPhotosByEvent = async (req, res) => {
    try {
        console.log(`[Photos] Fetching photos for event: ${req.params.eventId}`);
        // Sort by newest first and exclude heavy descriptors
        const photos = await Photo.find({ event: req.params.eventId })
            .select('-faceDescriptors') // EXCLUDE heavy AI data
            .sort({ createdAt: -1 })
            .lean(); // Use lean() for read-only speed boost
        console.log(`[Photos] Found ${photos.length} photos.`);
        res.json(photos);
    } catch (error) {
        console.error("[Photos] Error fetching event photos:", error);
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
        let publicId = '';

        // File upload from Multer
        if (req.file) {
            if (req.file.buffer) {
                console.log(`[Photo] Uploading buffer (${req.file.originalname})...`);
                const uploaded = await uploadImage(req.file.buffer, 'events', req.file.originalname);
                url = uploaded.url;
                publicId = uploaded.publicId;
            } else if (req.file.path) {
                console.log(`[Photo] File received from Multer path: ${req.file.path}`);
                url = req.file.path;
            }
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
            publicId,
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
                let tempUpload;
                try {
                    // Upload temp selfie to Cloudflare R2 or Cloudinary for AI Service access
                    tempUpload = await uploadImage(file.buffer, 'temp_search', `selfie_${Date.now()}`);
                    console.log(`[Search] Temp Upload (${tempUpload.provider}): ${tempUpload.url}`);

                    const descriptors = await getAllFaceDescriptors(tempUpload.url);
                    if (descriptors && descriptors.length > 0) {
                        console.log(`[Search] Found ${descriptors.length} face(s) in selfie.`);
                        userDescriptors.push(...descriptors);
                    }

                } catch (err) {
                    console.error("[Search] Processing Failed for file:", err);
                } finally {
                    // ALWAYS cleanup temp selfie file
                    if (tempUpload && tempUpload.publicId) {
                        await deleteImage(tempUpload.publicId, tempUpload.provider).catch(e => console.error("Cleanup warning:", e));
                        console.log(`[Search] Cleaned up temp file: ${tempUpload.publicId}`);
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

        // 2. Stream photos from DB to reduce memory usage (LEAN for speed)
        const photoCursor = Photo.find({
            event: eventId,
            aiProcessed: true
        })
            .select('url faceDescriptors')
            .lean()
            .cursor({ batchSize: 100 });

        const normalizeVector = (v) => {
            let sum = 0;
            const len = v.length;
            for (let i = 0; i < len; i++) {
                sum += v[i] * v[i];
            }
            if (sum === 0) return v;
            const norm = Math.sqrt(sum);
            const normalized = new Float32Array(len);
            for (let i = 0; i < len; i++) {
                normalized[i] = v[i] / norm;
            }
            return normalized;
        };

        const dotProduct = (v1, v2) => {
            let dot = 0;
            const len = v1.length;
            for (let i = 0; i < len; i++) {
                dot += v1[i] * v2[i];
            }
            return dot;
        };

        const normalizedUserDescriptors = userDescriptors.map(normalizeVector);

        const matches = [];
        let photosProcessed = 0;

        // 3. Match faces with Cosine Similarity (Stream Processing)
        for (let doc = await photoCursor.next(); doc != null; doc = await photoCursor.next()) {
            photosProcessed++;
            let maxSimilarity = -1.0;

            // Check all faces in this photo against all user selfies
            if (doc.faceDescriptors) {
                for (const dbDesc of doc.faceDescriptors) {
                    if (!isValidDescriptor(dbDesc)) continue;

                    const normDbDesc = normalizeVector(dbDesc);

                    for (const userDesc of normalizedUserDescriptors) {
                        const sim = dotProduct(userDesc, normDbDesc);
                        if (sim > maxSimilarity) {
                            maxSimilarity = sim;
                        }
                    }
                }
            }

            // Categorize into Multi-Tier Matching: Direct Match vs Possible Match
            if (maxSimilarity >= POSSIBLE_MATCH_THRESHOLD) {
                const matchType = maxSimilarity >= HIGH_CONFIDENCE_THRESHOLD ? 'direct' : 'possible';
                const faceCount = doc.faceDescriptors ? doc.faceDescriptors.length : 1;
                matches.push({
                    photo: { _id: doc._id, url: doc.url },
                    maxSimilarity,
                    matchType,
                    faceCount
                });
            }

            if (photosProcessed % 100 === 0) {
                console.log(`[Search] - Processed ${photosProcessed} photos...`);
            }
        }

        // Sort by best match (highest similarity)
        matches.sort((a, b) => b.maxSimilarity - a.maxSimilarity);

        const MAX_RESULTS = 60;
        const limitedMatches = matches.slice(0, MAX_RESULTS);

        console.log(`[Search] Processed ${photosProcessed} photos. Matches found: ${matches.length}, Returning: ${limitedMatches.length}`);

        // 4. Transform matches for display with LIGHTWEIGHT URLs
        const results = limitedMatches.map(({ photo, maxSimilarity, matchType, faceCount }) => {
            let thumbnailUrl = photo.url;

            if (photo.url.includes('/upload/')) {
                const parts = photo.url.split('/upload/');
                thumbnailUrl = `${parts[0]}/upload/w_400,c_limit,q_auto,f_auto/${parts[1]}`;
            }

            const confidence = Math.max(0, Math.round(maxSimilarity * 100));

            return {
                _id: photo._id,
                url: thumbnailUrl,
                downloadUrl: photo.url,
                confidence: confidence,
                matchType: matchType,
                faceCount: faceCount || 1
            };
        });

        res.json(results);

    } catch (error) {
        console.error("Search Photos Error:", error);
        console.error("Error Type:", error.constructor.name);
        console.error("Error Message:", error.message);
        console.error("Stack Trace:", error.stack);

        // Return more specific error message for debugging
        const errorMessage = process.env.NODE_ENV === 'production'
            ? 'Server Error during face search'
            : `Search Error: ${error.message}`;

        res.status(500).json({
            message: errorMessage,
            error: process.env.NODE_ENV === 'production' ? undefined : error.message
        });
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
            if (photo.publicId) {
                await deleteImage(photo.publicId);
            } else if (photo.url && photo.url.includes('cloudinary')) {
                try {
                    const urlParts = photo.url.split('/');
                    const filenameWithExt = urlParts[urlParts.length - 1];
                    const folderName = urlParts[urlParts.length - 2];
                    const publicId = `${folderName}/${filenameWithExt.split('.')[0]}`;
                    await deleteImage(publicId);
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
            if (photo.publicId) {
                await deleteImage(photo.publicId);
            } else if (photo.url && photo.url.includes('cloudinary')) {
                try {
                    const urlParts = photo.url.split('/');
                    const filenameWithExt = urlParts[urlParts.length - 1];
                    const folderName = urlParts[urlParts.length - 2];
                    const publicId = `${folderName}/${filenameWithExt.split('.')[0]}`;
                    await deleteImage(publicId);
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

                if (descriptors && descriptors.length > 0) {
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
