import express from 'express';
import { addPhoto, getPhotosByEvent, deletePhoto, searchPhotos, deletePhotos } from '../controllers/photoController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload, searchUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/search', searchUpload.single('image'), searchPhotos); // Public AI Search (Cloudinary Raw)
router.post('/delete-batch', protect, admin, deletePhotos); // Batch Delete
router.route('/').post(protect, admin, upload.single('image'), addPhoto);
router.route('/:eventId').get(protect, getPhotosByEvent);
router.route('/:id').delete(protect, admin, deletePhoto);

export default router;
