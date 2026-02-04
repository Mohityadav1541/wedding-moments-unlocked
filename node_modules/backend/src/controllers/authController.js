import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    let { email, password } = req.body;
    email = email.toLowerCase();

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        if (user.isBlocked) {
            res.status(403).json({ message: 'Your account has been blocked. Contact Super Admin.' });
            return;
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            subscription: {
                status: user.subscriptionStatus,
                plan: user.currentPlan,
                quota: user.eventQuota,
                expiresAt: user.planExpiresAt,
                studioName: user.studioName
            },
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (or Admin depending on requirements)
export const registerUser = async (req, res) => {
    let { name, email, password, role, studioName, phone, upiId } = req.body;
    email = email.toLowerCase();

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    const userData = {
        name,
        email,
        password,
        role: role || 'user',
        studioName
    };

    // Add phone and payment details if provided (optional)
    if (phone) {
        userData.phone = phone;
    }
    if (upiId) {
        userData.paymentDetails = {
            upiId,
            mobileNumber: phone,
            name: name
        };
    }

    const user = await User.create(userData);

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            email: user.email,
            role: user.role,
            studioName: user.studioName,
            subscription: {
                status: user.subscriptionStatus,
                plan: user.currentPlan,
                quota: user.eventQuota
            },
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};
