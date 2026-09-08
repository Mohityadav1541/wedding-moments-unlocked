import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        email = email.toLowerCase().trim();

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            if (user.isBlocked) {
                return res.status(403).json({ message: 'Your account has been blocked. Contact Super Admin.' });
            }

            return res.json({
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
        }

        res.status(401).json({ message: 'Invalid email or password' });
    } catch (error) {
        console.error('[Auth] Login Error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (or Admin depending on requirements)
export const registerUser = async (req, res) => {
    try {
        let { name, email, password, role, studioName, phone, upiId } = req.body;
        
        if (!email || !password || !name) {
            res.status(400).json({ message: 'Please provide all required fields (name, email, password)' });
            return;
        }

        email = email.toLowerCase().trim();

        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400).json({ message: 'User already exists with this email address' });
            return;
        }

        // Clean phone digits
        let cleanedPhone = phone ? String(phone).replace(/\D/g, '') : '';
        if (cleanedPhone && cleanedPhone.length > 10) {
            cleanedPhone = cleanedPhone.slice(-10); // Keep 10 digits
        }

        const userData = {
            name,
            email,
            password,
            role: role || 'admin',
            studioName: studioName || name
        };

        if (cleanedPhone) {
            userData.phone = cleanedPhone;
        }
        if (upiId) {
            userData.paymentDetails = {
                upiId,
                mobileNumber: cleanedPhone,
                name: name
            };
        }

        const user = await User.create(userData);

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
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
    } catch (error) {
        console.error("Register Error:", error);
        res.status(400).json({ message: error.message || 'Registration failed' });
    }
};
