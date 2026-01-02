import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

// @desc    Create a new transaction (User submits payment)
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req, res) => {
    try {
        const { plan, amount, upiTransactionId, screenshot } = req.body;

        const transaction = new Transaction({
            user: req.user._id,
            plan,
            amount,
            upiTransactionId,
            screenshot // Optional Cloudinary URL
        });

        const createdTransaction = await transaction.save();

        res.status(201).json(createdTransaction);
    } catch (error) {
        res.status(400).json({ message: 'Invalid transaction data', error: error.message });
    }
};

// @desc    Get all transactions (Super Admin)
// @route   GET /api/transactions
// @access  Private/SuperAdmin
export const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get my transactions
// @route   GET /api/transactions/my
// @access  Private
export const getMyTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Approve/Reject Transaction
// @route   PUT /api/transactions/:id/status
// @access  Private/SuperAdmin
export const updateTransactionStatus = async (req, res) => {
    const { status } = req.body; // 'approved' or 'rejected'

    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.status !== 'pending' && transaction.status !== status) {
            // Only block if trying to change to a different status (e.g. approved -> pending)
            // Allow approved -> approved to re-trigger user update logic
            return res.status(400).json({ message: 'Transaction already processed' });
        }

        transaction.status = status;
        transaction.approvedBy = req.user._id;
        transaction.approvedAt = Date.now();

        await transaction.save();

        if (status === 'approved') {
            const user = await User.findById(transaction.user);
            if (user) {
                // Update User Plan based on transaction
                const planDetails = getPlanDetails(transaction.plan);

                user.subscriptionStatus = 'active';
                user.currentPlan = transaction.plan;

                // Expiry Logic
                const now = new Date();
                if (planDetails.period === 'month') {
                    user.planExpiresAt = new Date(now.setMonth(now.getMonth() + 1));
                    user.eventQuota = 9999; // Unlimited effectively
                } else if (planDetails.period === 'year') {
                    user.planExpiresAt = new Date(now.setFullYear(now.getFullYear() + 1));
                    user.eventQuota = 9999;
                } else {
                    // Per Event Packages
                    user.planExpiresAt = null; // No time expiry for quota? Or maybe 1 year? Let's say indefinite quota.
                    // Add to existing quota or reset? Usually add.
                    user.eventQuota = (user.eventQuota || 0) + 1; // "One Event Package" implies 1 event.
                    // Or if "Basic" gives 2000 photos, maybe it allows 1 event with 2000 photos.
                    // The user said "if he choose one event package than only he have able to create an event"
                    // So we increment quota.
                }

                user.photoLimit = planDetails.photoLimit;
                user.storageLimit = planDetails.storageLimit;

                await user.save();
            }
        }

        res.json(transaction);
    } catch (error) {
        console.error("Error approving transaction:", error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// Helper to get hardcoded plan details (Mirroring frontend for safety)
const getPlanDetails = (planName) => {
    const normalizedPlan = planName?.toLowerCase().trim();
    switch (normalizedPlan) {
        case 'basic':
            return { photoLimit: 2000, storageLimit: 60, period: 'event' };
        case 'standard':
            return { photoLimit: 5000, storageLimit: 120, period: 'event' };
        case 'premium':
            return { photoLimit: 10000, storageLimit: 365, period: 'event' };
        case 'studio monthly':
            return { photoLimit: 1000000, storageLimit: 365, period: 'month' }; // Unlimited
        case 'studio yearly':
            return { photoLimit: 1000000, storageLimit: 365, period: 'year' };
        default:
            console.warn(`Unknown plan name: ${planName}`);
            return { photoLimit: 0, storageLimit: 0, period: 'none' };
    }
};
