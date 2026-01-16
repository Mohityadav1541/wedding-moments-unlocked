import UnlockRequest from '../models/UnlockRequest.js';
import Event from '../models/Event.js';
import Photo from '../models/Photo.js';

// @desc    Guest requests to unlock photos (submits Payment Proof)
// @route   POST /api/unlock/request
// @access  Public
export const createUnlockRequest = async (req, res) => {
    try {
        const { eventId, photoIds, transactionId, guestEmail, amount } = req.body;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Validate amount (simple check)
        const expectedAmount = (event.pricePerPhoto || 0) * photoIds.length;
        if (amount < expectedAmount) {
            // We could block, but maybe they negotiated? Let's just warn or allow.
            // Strict mode:
            // return res.status(400).json({ message: 'Amount mismatch' });
        }

        const newRequest = new UnlockRequest({
            event: eventId,
            photographer: event.user,
            photos: photoIds,
            totalAmount: amount,
            transactionId,
            guestEmail,
            status: 'pending'
        });

        await newRequest.save();

        res.status(201).json(newRequest);
    } catch (error) {
        console.error("Create Unlock Request Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get requests for a photographer
// @route   GET /api/unlock/photographer
// @access  Private (Photographer)
export const getPhotographerRequests = async (req, res) => {
    try {
        // Find requests where photographer matches current user
        const requests = await UnlockRequest.find({ photographer: req.user._id })
            .populate('event', 'name')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        console.error("Get Unlock Requests Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Approve/Reject request
// @route   PUT /api/unlock/:id/status
// @access  Private (Photographer)
export const updateUnlockStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        const request = await UnlockRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Verify ownership
        if (request.photographer.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        request.status = status;
        const updatedRequest = await request.save();

        res.json(updatedRequest);
    } catch (error) {
        console.error("Update Unlock Status Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Check status of specific photos for a guest (by Email or TransactionID)
// @route   POST /api/unlock/check
// @access  Public
export const checkUnlockStatus = async (req, res) => {
    try {
        const { guestEmail, photoIds } = req.body;

        // Find ALL approved requests for this email
        const approvedRequests = await UnlockRequest.find({
            guestEmail: guestEmail,
            status: 'approved'
        });

        // Collect all unlocked photo IDs
        const unlockedPhotoIds = new Set();
        approvedRequests.forEach(req => {
            req.photos.forEach(pid => unlockedPhotoIds.add(pid.toString()));
        });

        res.json({
            unlockedPhotoIds: Array.from(unlockedPhotoIds)
        });
    } catch (error) {
        console.error("Check Unlock Status Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
