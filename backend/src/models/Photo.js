import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Event',
        index: true
    },
    url: {
        type: String,
        required: true,
    },
    publicId: {
        type: String, // Cloudinary ID or similar
        required: false,
    },
    faceDescriptors: {
        type: [[Number]], // Array of 128-float arrays (one per face)
        default: []
    },
    aiProcessed: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true,
});

// Add compound text index for efficient querying
photoSchema.index({ event: 1, aiProcessed: 1 });

const Photo = mongoose.model('Photo', photoSchema);

export default Photo;
