import express from 'express';
import { addPhoto, getPhotosByEvent, deletePhoto, searchPhotos, deletePhotos } from '../controllers/photoController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import memoryUpload from '../middleware/memoryMiddleware.js';

const router = express.Router();

router.post('/search', memoryUpload.single('image'), searchPhotos); // Public AI Search (RAM only)
router.post('/delete-batch', protect, admin, deletePhotos); // Batch Delete
router.route('/').post(protect, admin, upload.single('image'), addPhoto);
router.route('/:eventId').get(protect, getPhotosByEvent);
router.route('/:id').delete(protect, admin, deletePhoto);

export default router;
