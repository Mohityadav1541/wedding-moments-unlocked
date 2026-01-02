import express from 'express';
import { protect, admin, superAdmin } from '../middleware/authMiddleware.js';
import {
    createTransaction,
    getAllTransactions,
    getMyTransactions,
    updateTransactionStatus
} from '../controllers/transactionController.js';

const router = express.Router();

router.route('/').post(protect, admin, createTransaction).get(protect, superAdmin, getAllTransactions);
router.route('/my').get(protect, admin, getMyTransactions);
router.route('/:id/status').put(protect, superAdmin, updateTransactionStatus);

export default router;
