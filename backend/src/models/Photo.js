import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Event',
    },
    url: {
        type: String,
        required: true,
    },
    publicId: {
        type: String, // Cloudinary ID or similar
        required: false,
    },
    faceDescriptor: {
        type: [Number], // 128-float array for face embedding
        default: []
    }
}, {
    timestamps: true,
});

const Photo = mongoose.model('Photo', photoSchema);

export default Photo;
