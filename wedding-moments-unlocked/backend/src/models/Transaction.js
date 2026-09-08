import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    plan: {
        type: String,
        required: true,
        enum: ['Basic', 'Standard', 'Premium', 'Studio Monthly', 'Studio Yearly']
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        default: 'UPI'
    },
    upiTransactionId: {
        type: String,
        required: true
    },
    screenshot: {
        type: String, // URL to screenshot
        required: false
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    }
}, {
    timestamps: true,
});

// Index for fast per-user transaction lookups
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
