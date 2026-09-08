import mongoose from 'mongoose';

const unlockRequestSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Event',
    },
    // We store photo Public IDs or backend IDs
    photos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Photo'
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    guestEmail: {
        type: String,
        required: false // Optional if we use browser storage, but Email is safer
    },
    transactionId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    photographer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true,
});

const UnlockRequest = mongoose.model('UnlockRequest', unlockRequestSchema);

export default UnlockRequest;
