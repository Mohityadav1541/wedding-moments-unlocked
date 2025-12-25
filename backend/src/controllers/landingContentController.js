
import LandingContent from '../models/LandingContent.js';

// @desc    Get all landing page content
// @route   GET /api/content
// @access  Public
export const getAllContent = async (req, res) => {
    try {
        const content = await LandingContent.find({});
        // Convert array to object map for easier frontend consumption
        const contentMap = content.reduce((acc, item) => {
            acc[item.key] = item.value;
            return acc;
        }, {});

        res.json(contentMap);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get specific section content
// @route   GET /api/content/:key
// @access  Public
export const getContentByKey = async (req, res) => {
    try {
        const content = await LandingContent.findOne({ key: req.params.key });

        if (content) {
            res.json(content.value);
        } else {
            res.status(404).json({ message: 'Content not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
