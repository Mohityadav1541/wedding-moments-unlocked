import mongoose from 'mongoose';

const landingContentSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        enum: ['hero', 'features', 'steps', 'testimonials', 'photographers', 'cta']
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const LandingContent = mongoose.model('LandingContent', landingContentSchema);

export default LandingContent;
