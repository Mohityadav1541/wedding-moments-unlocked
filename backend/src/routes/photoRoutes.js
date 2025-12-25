import express from 'express';
import { addPhoto, getPhotosByEvent, deletePhoto } from '../controllers/photoController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/').post(protect, admin, upload.single('image'), addPhoto);
router.route('/:eventId').get(protect, getPhotosByEvent);
router.route('/:id').delete(protect, admin, deletePhoto);

export default router;
