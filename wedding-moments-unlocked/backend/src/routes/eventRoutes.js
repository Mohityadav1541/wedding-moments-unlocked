import express from 'express';
import {
    createEvent,
    getEvents,
    getEventById,
    getPublicEventById,
    markEventPaid,
    confirmEventPayment,
    getRevenueStats,
    deleteEvent,
    updateEvent,
    verifyEventPin
} from '../controllers/eventController.js';
import { protect, admin, superAdmin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/').post(protect, admin, createEvent).get(protect, getEvents);
router.route('/revenue').get(protect, superAdmin, getRevenueStats);

router.route('/verify-pin').post(verifyEventPin); // Public PIN verification
router.route('/public/:id').get(getPublicEventById); // Public access
router.route('/:id').get(protect, getEventById).delete(protect, superAdmin, deleteEvent).put(protect, admin, updateEvent);
router.route('/:id/pay').put(protect, admin, upload.single('screenshot'), markEventPaid);
router.route('/:id/confirm').put(protect, confirmEventPayment);

export default router;
