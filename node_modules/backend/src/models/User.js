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
        validate: {
            validator: function (v) {
                if (!v) return true; // Allow empty
                return /^[0-9]{10}$/.test(v);
            },
            message: 'Phone number must be exactly 10 digits'
        }
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
    paymentDetails: {
        upiId: {
            type: String,
            required: false,
            validate: {
                validator: function (v) {
                    if (!v) return true; // Allow empty
                    return /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/.test(v);
                },
                message: 'Invalid UPI ID format (e.g., username@paytm or 9876543210@ybl)'
            }
        },
        mobileNumber: { type: String },
        name: { type: String } // Payee Name
    }
}, {
    timestamps: true,
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
