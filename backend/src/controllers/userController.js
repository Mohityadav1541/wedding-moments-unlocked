import User from '../models/User.js';

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
