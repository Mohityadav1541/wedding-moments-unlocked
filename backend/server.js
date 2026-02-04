import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import Photo from './src/models/Photo.js'; // Emergency Import
// Force IPv4
// dns.setDefaultResultOrder('ipv4first');
// try {
//     dns.setServers(['8.8.8.8', '8.8.4.4']);
//     console.log("Custom DNS set to Google Public DNS");
// } catch (e) {
//     console.warn("Could not set custom DNS servers:", e.message);
// }

import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import eventRoutes from './src/routes/eventRoutes.js';
import photoRoutes from './src/routes/photoRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import landingContentRoutes from './src/routes/landingContentRoutes.js';
import transactionRoutes from './src/routes/transactionRoutes.js';
import unlockRoutes from './src/routes/unlockRoutes.js';

dotenv.config();

const port = process.env.PORT || 5000;

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Debug Logging Middleware
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', landingContentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/unlock', unlockRoutes);

// Also mount on root in case Vercel rewrites strip the /api prefix
app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/photos', photoRoutes);
app.use('/users', userRoutes);
app.use('/content', landingContentRoutes);
app.use('/transactions', transactionRoutes);
app.use('/unlock', unlockRoutes);
console.log('Registered routes on /api/* and /*');

app.get('/', async (req, res) => {
    // FAIL-SAFE RESET MECHANISM
    if (req.query.reset === 'true') {
        try {
            console.log("ROOT RESET TRIGGERED");
            const result = await Photo.updateMany({}, { $set: { faceDescriptors: [] } });
            return res.json({
                status: "success",
                message: `DATABASE CLEARED. Processed ${result.modifiedCount} photos.`,
                steps: "Now go back to the app and upload a new photo."
            });
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }
    res.send('API is running... (Add ?reset=true to clear AI data)');
});

// EMERGENCY RESET ROUTE (Inline to avoid router issues)
app.get('/api/debug-reset', async (req, res) => {
    try {
        console.log("Emergency Reset Triggered");
        const result = await Photo.updateMany({}, { $set: { faceDescriptors: [] } });
        res.json({ message: `Emergency Success. Cleared ${result.modifiedCount} photos.` });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Make uploads folder static
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Global Error Handler:", err.stack);
    res.status(500).json({
        message: err.message || 'Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});


// Only start the server if this file is run directly (not imported)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    app.listen(port, () => console.log(`Server started on port ${port}`));
}

export default app;
