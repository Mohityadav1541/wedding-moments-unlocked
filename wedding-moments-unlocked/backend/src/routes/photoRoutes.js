import express from 'express';
import { addPhoto, getPhotosByEvent, deletePhoto, searchPhotos, deletePhotos, resetAIData, rescanPhotos } from '../controllers/photoController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload, searchUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

import rateLimit from 'express-rate-limit';

const searchLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Limit each IP to 30 search requests per windowMs
    message: { message: 'Too many search requests from this IP, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/search', searchLimiter, searchUpload.array('images'), searchPhotos); // Public AI Search (Cloudinary Raw)
router.get('/reset-ai-data', resetAIData); // Public Reset
router.post('/rescan', protect, admin, rescanPhotos); // NEW: Recovery Endpoint
router.post('/delete-batch', protect, admin, deletePhotos); // Batch Delete
router.route('/').post(protect, admin, upload.single('image'), addPhoto);
// Public Route for Gallery Fallback
router.route('/:eventId').get(getPhotosByEvent);
router.route('/:id').delete(protect, admin, deletePhoto);

export default router;
