import Event from '../models/Event.js';
import User from '../models/User.js';
import Photo from '../models/Photo.js';
import { cloudinary } from '../config/cloudinary.js';

// @desc    Get all events
// @route   GET /api/events
// @access  Private/Admin
export const getEvents = async (req, res) => {
    try {
        let query = { user: req.user._id };

        // If superadmin, get ALL events
        if (req.user.role === 'superadmin') {
            query = {};
        }

        const eventsDocs = await Event.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .lean(); // Use lean to return plain JS objects

        // Fetch photo counts for each event
        const events = await Promise.all(eventsDocs.map(async (event) => {
            const photoCount = await Photo.countDocuments({ event: event._id });
            return { ...event, photoCount };
        }));

        res.json(events);
    } catch (error) {
        console.error("Get Events Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private/Admin
export const createEvent = async (req, res) => {
    const { name, date, location, selectedPackage, pricePerPhoto } = req.body;

    try {
        const user = await User.findById(req.user._id);

        // 1. Check Subscription Status
        const now = new Date();
        const hasActiveSubscription = user.subscriptionStatus === 'active' && user.planExpiresAt && new Date(user.planExpiresAt) > now;
        const hasQuota = user.eventQuota > 0;

        // "Studio Monthly" and "Studio Yearly" are unlimited (handled by keeping quota high or checking plan name)
        // But per our logic, we gave them 9999 quota.
        // "Basic", "Standard", "Premium" are per-event (quota based).

        // If user has NO active subscription AND NO quota, they cannot create event.
        // (Unless they are SuperAdmin)
        if (req.user.role !== 'superadmin') {
            if (!hasActiveSubscription && !hasQuota) {
                return res.status(403).json({
                    message: 'Subscription expired or no event quota available. Please recharge.',
                    code: 'SUBSCRIPTION_REQUIRED'
                });
            }
        }

        const event = new Event({
            user: req.user._id,
            name,
            date,
            date,
            location,
            package: user.currentPlan || 'None', // Event inherits user's plan at time of creation
            price: 0, // Price handled via external subscription now
            pricePerPhoto: pricePerPhoto || 0, // Set per-photo download price
            paymentStatus: 'confirmed', // Auto-confirm as subscription/quota is used
            superAdminConfirmed: true, // Auto-confirm as subscription is pre-paid
            features: {
                watermarkEnabled: true,
                watermarkText: user.studioName || 'Wedding Moments AI',
                qrCode: true,
                faceRecognition: true
            }
        });

        const createdEvent = await event.save();

        // Decrement Quota if applicable
        if (req.user.role !== 'superadmin' && user.eventQuota > 0) {
            user.eventQuota = user.eventQuota - 1;
            await user.save();
        }

        res.status(201).json(createdEvent);
    } catch (error) {
        console.error("Create Event Error:", error);
        res.status(400).json({ message: error.message || 'Invalid data' });
    }
};

// @desc    Update event details (e.g. settings)
// @route   PUT /api/events/:id
// @access  Private/Admin
export const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (event) {
            // Check authorization
            if (event.user.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
                return res.status(401).json({ message: 'Not authorized' });
            }

            // Update fields if present in body
            if (req.body.name) event.name = req.body.name;
            if (req.body.date) event.date = req.body.date;
            if (req.body.location) event.location = req.body.location;
            if (req.body.pricePerPhoto !== undefined) event.pricePerPhoto = req.body.pricePerPhoto;

            // Update features carefully (merge)
            if (req.body.features) {
                event.features = {
                    ...event.features, // existing
                    ...req.body.features // new
                };
            }

            const updatedEvent = await event.save();
            res.json(updatedEvent);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error("Update Event Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Mark event as paid (by Photographer)
// @route   PUT /api/events/:id/pay
// @access  Private/Admin
export const markEventPaid = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (event) {
            if (event.user.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
                return res.status(401).json({ message: 'Not authorized' });
            }

            event.paymentStatus = 'paid';

            if (req.file) {
                event.paymentScreenshot = req.file.path;
            }

            const updatedEvent = await event.save();
            res.json(updatedEvent);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error("Mark Paid Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Confirm event payment (by Super Admin)
// @route   PUT /api/events/:id/confirm
// @access  Private/SuperAdmin
export const confirmEventPayment = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (event) {
            event.paymentStatus = 'confirmed';
            event.superAdminConfirmed = true;
            const updatedEvent = await event.save();
            res.json(updatedEvent);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get revenue statistics
// @route   GET /api/events/revenue
// @access  SuperAdmin
export const getRevenueStats = async (req, res) => {
    try {
        const events = await Event.find({ superAdminConfirmed: true });

        const totalRevenue = events.reduce((acc, event) => acc + (event.price || 0), 0);
        const totalEvents = events.length;

        // Group by month
        const revenueByMonth = events.reduce((acc, event) => {
            const date = new Date(event.date);
            const month = date.toLocaleString('default', { month: 'short' });
            acc[month] = (acc[month] || 0) + (event.price || 0);
            return acc;
        }, {});

        // Format for frontend chart
        const graphData = Object.keys(revenueByMonth).map(month => ({
            name: month,
            total: revenueByMonth[month]
        }));

        res.json({
            totalRevenue,
            totalEvents,
            graphData,
            recentTransactions: events.slice(0, 5) // Last 5 confirmed events
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get event by ID
// @route   GET /api/events/:id (PRIVATE)
// @access  Private/Admin
export const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('user', 'name email');

        if (event) {
            // Check ownership
            let eventUserId = null;
            if (event.user) {
                eventUserId = event.user._id ? event.user._id.toString() : event.user.toString();
            }

            if (req.user.role !== 'superadmin') {
                if (!eventUserId || eventUserId !== req.user._id.toString()) {
                    return res.status(401).json({ message: 'Not authorized' });
                }
            }
            res.json(event);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error("Get Event Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get public event details
// @route   GET /api/events/public/:id (PUBLIC)
// @access  Public
export const getPublicEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('user', 'name studioName paymentDetails');

        if (event) {
            const photoCount = await Photo.countDocuments({ event: event._id });

            // Return only safe fields for guests
            const publicData = {
                _id: event._id,
                name: event.name,
                date: event.date,
                location: event.location,
                coverImage: event.coverImage,
                package: event.package,
                price: event.price,
                pricePerPhoto: event.pricePerPhoto || 0,
                photoCount, // Add count here
                user: {
                    name: event.user?.name,
                    studioName: event.user?.studioName,
                    paymentDetails: event.user?.paymentDetails
                },
                features: event.features,
                photos: []
            };
            res.json(publicData);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error("Get Public Event Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};


// @desc    Delete event and all its photos
// @route   DELETE /api/events/:id
// @access  Private/SuperAdmin
export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (event) {
            // Check authorization: SuperAdmin only as per request
            if (req.user.role !== 'superadmin') {
                return res.status(401).json({ message: 'Not authorized. Only Super Admin can delete events.' });
            }

            // Find all photos for this event
            const photos = await Photo.find({ event: req.params.id });

            // Delete from Cloudinary
            for (const photo of photos) {
                if (photo.url && photo.url.includes('cloudinary')) {
                    try {
                        const urlParts = photo.url.split('/');
                        const filenameWithExt = urlParts[urlParts.length - 1];
                        const folderName = urlParts[urlParts.length - 2];
                        const publicId = `${folderName}/${filenameWithExt.split('.')[0]}`;
                        await cloudinary.uploader.destroy(publicId);
                    } catch (err) {
                        console.error(`Failed to delete photo ${photo._id} from Cloudinary:`, err);
                    }
                }
            }

            // Delete photos from DB
            await Photo.deleteMany({ event: req.params.id });

            // Delete event
            await event.deleteOne();

            res.json({ message: 'Event and all associated photos removed' });
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
