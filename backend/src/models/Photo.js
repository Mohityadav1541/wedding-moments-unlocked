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
    faces: [{ // Array of embeddings or face IDs if implementing face rec
        type: String
    }]
}, {
    timestamps: true,
});

const Photo = mongoose.model('Photo', photoSchema);

export default Photo;
