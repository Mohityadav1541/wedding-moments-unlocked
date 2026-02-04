import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

// @desc    Create a new transaction (User submits payment)
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req, res) => {
    try {
        const { plan, amount, upiTransactionId, screenshot, mobileNumber } = req.body;

        // Validate mobile number (exactly 10 digits)
        if (!mobileNumber || !/^[0-9]{10}$/.test(mobileNumber)) {
            return res.status(400).json({
                message: 'Mobile number must be exactly 10 digits'
            });
        }

        // Validate UPI Transaction ID (mandatory, 12 digits)
        if (!upiTransactionId || !/^[0-9]{12}$/.test(upiTransactionId)) {
            return res.status(400).json({
                message: 'UPI Transaction ID must be exactly 12 digits'
            });
        }

        const transaction = new Transaction({
            user: req.user._id,
            plan,
            amount,
            upiTransactionId,
            screenshot, // Optional Cloudinary URL
            mobileNumber
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
        console.log(`[Transaction] Processing approval for ID: ${req.params.id} with status: ${status}`);
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            console.error(`[Transaction] Not Found: ${req.params.id}`);
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.status !== 'pending' && transaction.status !== status) {
            console.warn(`[Transaction] Already processed: ${transaction.status}`);
            return res.status(400).json({ message: 'Transaction already processed' });
        }

        transaction.status = status;
        transaction.approvedBy = req.user._id;
        transaction.approvedAt = Date.now();

        await transaction.save();
        console.log(`[Transaction] Saved status: ${status}`);

        if (status === 'approved') {
            console.log(`[Transaction] Fetching user: ${transaction.user}`);
            const user = await User.findById(transaction.user);
            if (user) {
                console.log(`[Transaction] User found: ${user.email} (Current Plan: ${user.currentPlan})`);

                // Update User Plan based on transaction
                const planDetails = getPlanDetails(transaction.plan);
                console.log(`[Transaction] Plan Details for '${transaction.plan}':`, planDetails);

                user.subscriptionStatus = 'active';
                user.currentPlan = transaction.plan;

                // Expiry Logic
                const now = new Date();
                if (planDetails.period === 'month') {
                    user.planExpiresAt = new Date(now.setMonth(now.getMonth() + 1));
                    user.eventQuota = 9999;
                } else if (planDetails.period === 'year') {
                    user.planExpiresAt = new Date(now.setFullYear(now.getFullYear() + 1));
                    user.eventQuota = 9999;
                } else {
                    user.planExpiresAt = null;
                    user.eventQuota = (user.eventQuota || 0) + 1;
                }

                user.photoLimit = planDetails.photoLimit;
                user.storageLimit = planDetails.storageLimit;

                const updatedUser = await user.save();
                console.log(`[Transaction] User updated successfully. New Status: ${updatedUser.subscriptionStatus}, Quota: ${updatedUser.eventQuota}`);
            } else {
                console.error(`[Transaction] User NOT found for ID: ${transaction.user}`);
            }
        }

        res.json(transaction);
    } catch (error) {
        console.error("[Transaction] Error approving transaction:", error);
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
