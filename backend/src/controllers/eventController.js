import Event from '../models/Event.js';
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

        const events = await Event.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private/Admin
export const createEvent = async (req, res) => {
    const { name, date, location, selectedPackage } = req.body;

    // Determine price based on package
    let price = 1499; // Standard default
    if (selectedPackage === 'Premium') {
        price = 2999;
    }

    try {
        const event = new Event({
            user: req.user._id,
            name,
            date,
            location,
            package: selectedPackage || 'Standard',
            price,
            paymentStatus: 'pending', // Default
            superAdminConfirmed: false
        });

        const createdEvent = await event.save();
        res.status(201).json(createdEvent);
    } catch (error) {
        console.error("Create Event Error:", error);
        res.status(400).json({ message: error.message || 'Invalid data' });
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
// @route   GET /api/events/:id
// @access  Private/Admin
export const getEventById = async (req, res) => {
    try {
        console.log("getEventById request ID:", req.params.id);
        const event = await Event.findById(req.params.id).populate('user', 'name email');
        console.log("getEventById found:", event ? "Yes" : "No");

        if (event) {
            // Check ownership (handle populated user object or direct ID)
            let eventUserId = null;
            if (event.user) {
                eventUserId = event.user._id ? event.user._id.toString() : event.user.toString();
            }

            // Authorization: Allow Super Admin OR Owner (if owner exists)
            // If owner is deleted (null), only Super Admin can see it.
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

