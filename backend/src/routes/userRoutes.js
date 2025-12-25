import express from 'express';
import { getPhotographers, updateUserStatus, deleteUser } from '../controllers/userController.js';
import { protect, superAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/photographers', protect, superAdmin, getPhotographers);
router.route('/:id').delete(protect, superAdmin, deleteUser);
router.route('/:id/status').put(protect, superAdmin, updateUserStatus);

export default router;
