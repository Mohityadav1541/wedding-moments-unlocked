import express from 'express';
import { getPhotographers, updateUserStatus, deleteUser, getUserProfile, updateUserProfile } from '../controllers/userController.js';
import { protect, superAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/photographers', protect, superAdmin, getPhotographers);
router.route('/:id').delete(protect, superAdmin, deleteUser);
router.route('/:id/status').put(protect, superAdmin, updateUserStatus);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

export default router;
