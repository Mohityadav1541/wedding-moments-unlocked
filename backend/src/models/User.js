import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'superadmin'],
        default: 'user',
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    phone: {
        type: String,
        required: false,
    },
    whatsapp: {
        type: String,
        required: false,
    },
    studioName: {
        type: String,
        required: false,
    },
    // Subscription Fields
    subscriptionStatus: {
        type: String,
        enum: ['inactive', 'active', 'expired'],
        default: 'inactive'
    },
    currentPlan: {
        type: String,
        enum: ['None', 'Basic', 'Standard', 'Premium', 'Studio Monthly', 'Studio Yearly'],
        default: 'None'
    },
    planExpiresAt: {
        type: Date
    },
    eventQuota: {
        type: Number,
        default: 0 // For per-event plans
    },
    photoLimit: {
        type: Number,
        default: 0
    },
    storageLimit: {
        type: Number, // In days
        default: 0
    },
    upiId: {
        type: String // For receiving payments (studio) or verification (user)
    }
}, {
    timestamps: true,
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
