import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    name: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    location: {
        type: String,
        required: false,
    },
    coverImage: {
        type: String, // URL to image
        required: false,
    },
    accessPin: {
        type: String, // Optional 4-digit PIN for event access
        required: false,
        default: null
    },
    features: {
        qrCode: { type: Boolean, default: true },
        faceRecognition: { type: Boolean, default: true },
        watermarkEnabled: { type: Boolean, default: false },
        watermarkText: { type: String, default: '' }
    },
    // Payment & Package Details
    package: {
        type: String,
        enum: ['Basic', 'Standard', 'Premium', 'Studio Monthly', 'Studio Yearly'],
        required: false,
        default: 'Standard'
    },
    price: {
        type: Number,
        required: true,
        default: 1499
    },
    pricePerPhoto: {
        type: Number,
        default: 0
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'confirmed'],
        default: 'pending'
    },
    superAdminConfirmed: {
        type: Boolean,
        default: false
    },
    paymentScreenshot: {
        type: String, // Path to uploaded screenshot
        required: false
    }
}, {
    timestamps: true,
});

// Critical indexes for fast dashboard queries
eventSchema.index({ user: 1, createdAt: -1 });
eventSchema.index({ superAdminConfirmed: 1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;
