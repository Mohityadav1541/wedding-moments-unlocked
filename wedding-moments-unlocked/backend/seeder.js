import mongoose from 'mongoose';
import dns from 'dns';
// Force IPv4 and Google DNS to bypass local network restrictions (Same as server.js)
dns.setDefaultResultOrder('ipv4first');
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
    console.warn("Could not set custom DNS servers:", e.message);
}
import dotenv from 'dotenv';
import colors from 'colors';
import User from './src/models/User.js';
import connectDB from './src/config/db.js';

import LandingContent from './src/models/LandingContent.js';
import Event from './src/models/Event.js';
import Photo from './src/models/Photo.js';

dotenv.config();

connectDB();

const importData = async () => {

    try {
        await Photo.deleteMany();
        await Event.deleteMany();
        await User.deleteMany();
        await LandingContent.deleteMany();

        const createdUsers = await User.create([
            {
                name: 'DUO MXG',
                email: 'mr.mohit1540@gmail.com',
                password: 'B93456a@5',
                role: 'superadmin',
                phone: '63671 39566',
                whatsapp: 'https://wa.me/6367139566' // Placeholder based on phone, updating script will confirm
            },
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123',
                role: 'admin',
            },
            {
                name: 'Regular User',
                email: 'user@example.com',
                password: 'password123',
                role: 'user',
            }
        ]);

        const landingContent = [
            {
                key: 'hero',
                value: {
                    badge: 'AI-POWERED PHOTO DISCOVERY',
                    headline: 'Your Memories,\nFound Instantly.',
                    subheadline: 'The smartest way to share and find photos. Upload a selfie and let our AI instantly deliver every photo you\'re in.',
                    ctaPrimary: 'Try Demo Event',
                    ctaSecondary: 'For Photographers',
                    stats: [
                        { value: '50K+', label: 'Photos Matched' },
                        { value: '500+', label: 'Events Hosted' },
                        { value: '98%', label: 'Match Accuracy' }
                    ]
                }
            },
            {
                key: 'features',
                value: [
                    { icon: 'QrCode', title: 'Scan & Discover', description: 'Simply scan the event QR code at your wedding venue to instantly access the photo gallery.' },
                    { icon: 'Camera', title: 'Upload Your Selfie', description: 'Take a quick selfie and our AI will find all photos featuring you from the event.' },
                    { icon: 'Sparkles', title: 'AI Face Matching', description: 'Advanced facial recognition technology identifies you across hundreds of photos in seconds.' },
                    { icon: 'Download', title: 'Download Instantly', description: 'Get your photos instantly - free with watermark or premium HD without watermark.' },
                    { icon: 'Shield', title: 'Secure & Private', description: 'Your photos are encrypted and automatically deleted after the event for complete privacy.' },
                    { icon: 'CreditCard', title: 'Easy Payments', description: 'Seamless UPI payment integration for premium photo downloads.' }
                ]
            },
            {
                key: 'steps',
                value: [
                    { step: 1, title: 'Scan QR Code', description: 'Find the QR code at your event and scan it with your phone camera' },
                    { step: 2, title: 'Upload Selfie', description: 'Take a clear selfie or upload an existing photo of yourself' },
                    { step: 3, title: 'View Matches', description: 'Our AI finds all photos featuring you from the event gallery' },
                    { step: 4, title: 'Download', description: 'Download free watermarked or pay for premium HD photos' }
                ]
            },
            {
                key: 'testimonials',
                value: [
                    { name: 'Priya & Rahul', role: 'Newlyweds', content: 'We got 500+ photos from our wedding and our guests could find their photos instantly! Amazing experience.', avatar: 'PR' },
                    { name: 'Rajesh Kumar', role: 'Wedding Photographer', content: 'This platform has transformed how I deliver photos. My clients love the instant access and I get more referrals!', avatar: 'RK' },
                    { name: 'Meera Sharma', role: 'Wedding Guest', content: 'I found all 23 photos of myself in under 30 seconds. The AI is incredibly accurate!', avatar: 'MS' }
                ]
            },
            {
                key: 'photographers',
                value: {
                    title: 'Grow Your Wedding Photography Business',
                    description: 'Join hundreds of photographers who use our platform to deliver photos faster, earn more from each event, and grow their brand through watermarked photos.',
                    benefits: [
                        'Free tier available with watermarked downloads',
                        'Set your own pricing per photo or event',
                        'Custom watermark with your logo and contact',
                        'Direct UPI payment to your account',
                        'Real-time analytics and download tracking',
                        'Automatic face indexing with AI'
                    ]
                }
            }
        ];

        await LandingContent.insertMany(landingContent);

        console.log('Data Imported!'.green.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany();

        console.log('Data Destroyed!'.red.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
