import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Get all photographers (admin role)
// @route   GET /api/users/photographers
// @access  SuperAdmin
// @desc    Get all photographers (admin role)
// @route   GET /api/users/photographers
// @access  SuperAdmin
export const getPhotographers = async (req, res) => {
    try {
        const photographers = await User.aggregate([
            {
                $match: { role: 'admin' }
            },
            {
                $lookup: {
                    from: 'events',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'events'
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    role: 1,
                    isBlocked: 1,
                    createdAt: 1,
                    totalEvents: { $size: '$events' },
                    activeEvents: {
                        $size: {
                            $filter: {
                                input: '$events',
                                as: 'event',
                                cond: { $eq: ['$$event.superAdminConfirmed', true] }
                            }
                        }
                    },
                    inactiveEvents: {
                        $size: {
                            $filter: {
                                input: '$events',
                                as: 'event',
                                cond: { $eq: ['$$event.superAdminConfirmed', false] }
                            }
                        }
                    }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        res.json(photographers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user status (block/unblock)
// @route   PUT /api/users/:id/status
// @access  SuperAdmin
export const updateUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.isBlocked = req.body.isBlocked;
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                isBlocked: updatedUser.isBlocked,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  SuperAdmin
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                paymentDetails: user.paymentDetails,
                subscription: {
                    status: user.subscriptionStatus,
                    plan: user.currentPlan,
                    expiresAt: user.planExpiresAt,
                    quota: user.eventQuota
                }
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            user.studioName = req.body.studioName || user.studioName;

            // Payment Details
            if (req.body.paymentDetails) {
                user.paymentDetails = {
                    upiId: req.body.paymentDetails.upiId || user.paymentDetails?.upiId,
                    mobileNumber: req.body.paymentDetails.mobileNumber || user.paymentDetails?.mobileNumber,
                    name: req.body.paymentDetails.name || user.paymentDetails?.name
                };
            }

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                studioName: updatedUser.studioName,
                role: updatedUser.role,
                paymentDetails: updatedUser.paymentDetails,
                subscription: {
                    status: updatedUser.subscriptionStatus,
                    plan: updatedUser.currentPlan,
                    expiresAt: updatedUser.planExpiresAt,
                    quota: updatedUser.eventQuota
                },
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
