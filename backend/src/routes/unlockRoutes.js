import express from 'express';
import { createUnlockRequest, getPhotographerRequests, updateUnlockStatus, checkUnlockStatus } from '../controllers/unlockController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/request', createUnlockRequest); // Public: Guest submits
router.post('/check', checkUnlockStatus);     // Public: Guest checks status

// Private: Photographer manages
router.get('/photographer', protect, getPhotographerRequests);
router.put('/:id/status', protect, updateUnlockStatus);

export default router;
