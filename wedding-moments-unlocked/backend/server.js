import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// Load env BEFORE anything else
dotenv.config();

// Force IPv4 and set reliable DNS for MongoDB Atlas SRV resolution
dns.setDefaultResultOrder('ipv4first');
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
    console.warn('[DNS] Could not set custom DNS servers:', e.message);
}

import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import eventRoutes from './src/routes/eventRoutes.js';
import photoRoutes from './src/routes/photoRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import landingContentRoutes from './src/routes/landingContentRoutes.js';
import transactionRoutes from './src/routes/transactionRoutes.js';
import unlockRoutes from './src/routes/unlockRoutes.js';
import startKeepAlive from './src/services/aiKeepAlive.js';

const port = process.env.PORT || 5005;

connectDB();

const app = express();

import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

// --- SECURITY MIDDLEWARES ---
// Set security HTTP headers (HSTS, NoSniff, X-XSS-Protection, etc.)
app.use(helmet());
// Prevent NoSQL Injection
app.use(mongoSanitize());

// --- CORS ---
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL, 'https://ai-photo-scan.vercel.app'].filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5005'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        
        // In development, allow all for easy testing
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }

        // In production, strictly enforce allowed origins and Vercel preview deployments
        const isVercelPreview = origin.endsWith('.vercel.app');
        if (isVercelPreview || allowedOrigins.some(o => origin.startsWith(o) || o.startsWith(origin))) {
            return callback(null, true);
        }
        
        callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// --- RATE LIMITERS ---
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many login attempts. Please wait 15 minutes.' },
    skipSuccessfulRequests: true, // Don't count successful logins
});

app.use('/api/', generalLimiter);

// --- Request Logger (dev only) ---
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`[REQUEST] ${req.method} ${req.url}`);
        next();
    });
}

// --- Health Check (UptimeRobot / cron-job.org keep-alive pings) ---
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'online',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    });
});

// --- API Routes (ONLY /api/* — no shadow /xxx duplicates) ---
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', landingContentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/unlock', unlockRoutes);

// Static uploads (local dev only; in production, all assets are on Cloudinary/R2)
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root fallback
app.get('/', (req, res) => {
    res.json({ status: 'AI Photo Scan API is running', version: '1.0.0' });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
    console.error('[Global Error]', err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
});

// Only start the HTTP server when this file is run directly (not when imported by tests)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    app.listen(port, () => {
        console.log(`[Server] Started on port ${port} (${process.env.NODE_ENV || 'development'})`);
        if (process.env.HUGGING_FACE_API_URL) {
            startKeepAlive();
        } else {
            console.warn('[Server] HUGGING_FACE_API_URL not set — AI keep-alive disabled.');
        }
    });
}

export default app;
