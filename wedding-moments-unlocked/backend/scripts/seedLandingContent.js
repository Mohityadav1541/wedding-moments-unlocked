
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import LandingContent from '../src/models/LandingContent.js';

// Convert import.meta.url to __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();

    const features = [
        {
            icon: 'QrCode',
            title: "Scan & Discover",
            description: "Simply scan the event QR code at your wedding venue to instantly access the photo gallery."
        },
        {
            icon: 'Camera',
            title: "Upload Your Selfie",
            description: "Take a quick selfie and our AI will find all photos featuring you from the event."
        },
        {
            icon: 'Sparkles',
            title: "AI Face Matching",
            description: "Advanced facial recognition technology identifies you across hundreds of photos in seconds."
        },
        {
            icon: 'Download',
            title: "Download Instantly",
            description: "Get your photos instantly - free with watermark or premium HD without watermark."
        },
        {
            icon: 'Shield',
            title: "Secure & Private",
            description: "Your photos are encrypted and automatically deleted after the event for complete privacy."
        },
        {
            icon: 'CreditCard',
            title: "Easy Payments",
            description: "Seamless UPI payment integration for premium photo downloads."
        }
    ];

    const photographers = {
        title: "Grow Your Photography Business",
        description: "Join hundreds of photographers who use our platform to deliver photos instantly, impress clients, and earn more revenue.",
        benefits: [
            "Instant AI-powered photo delivery",
            "Zero manual sorting or categorization",
            "Secure and private galleries",
            "Automated payment collection",
            "Premium portfolio showcase"
        ]
    };

    const testimonials = [
        {
            name: "Priya & Rahul",
            role: "Newlyweds",
            content: "We got 500+ photos from our wedding and our guests could find their photos instantly! Amazing experience.",
            avatar: "PR"
        },
        {
            name: "Rajesh Kumar",
            role: "Wedding Photographer",
            content: "This platform has transformed how I deliver photos. My clients love the instant access and I get more referrals!",
            avatar: "RK"
        },
        {
            name: "Meera Sharma",
            role: "Wedding Guest",
            content: "I found all 23 photos of myself in under 30 seconds. The AI is incredibly accurate!",
            avatar: "MS"
        }
    ];

    // Schema Enum: ['hero', 'features', 'steps', 'testimonials', 'photographers', 'cta']
    try {
        await LandingContent.deleteMany({}); // Clear existing
        console.log('Existing content cleared');

        // Note: For 'features' and 'testimonials', the frontend expects the array directly or wrapped?
        // Let's look at api log logic: acc[item.key] = item.value.
        // Frontend: const { features } = content.
        // If we save 'features' as the array, content.features = array. Correct.

        await LandingContent.create({ key: 'features', value: features });
        await LandingContent.create({ key: 'photographers', value: photographers });
        await LandingContent.create({ key: 'testimonials', value: testimonials });

        console.log('Landing Page Content Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedData();
