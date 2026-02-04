import express from 'express';
import { addPhoto, getPhotosByEvent, deletePhoto, searchPhotos, deletePhotos, resetAIData, rescanPhotos } from '../controllers/photoController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload, searchUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/search', searchUpload.array('images'), searchPhotos); // Public AI Search (Cloudinary Raw)
router.get('/reset-ai-data', resetAIData); // Public Reset
router.post('/rescan', protect, admin, rescanPhotos); // NEW: Recovery Endpoint
router.post('/delete-batch', protect, admin, deletePhotos); // Batch Delete
router.route('/').post(protect, admin, upload.single('image'), addPhoto);
// Public Route for Gallery Fallback
router.route('/:eventId').get(getPhotosByEvent);
router.route('/:id').delete(protect, admin, deletePhoto);

export default router;
