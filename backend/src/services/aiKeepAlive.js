import cron from 'node-cron';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const AI_SERVICE_URL = process.env.HUGGING_FACE_API_URL;

const startKeepAlive = () => {
    if (!AI_SERVICE_URL) {
        console.warn('AI Service URL not configured. Keep-Alive disabled.');
        return;
    }

    console.log('🚀 AI Keep-Alive System Started');

    // Ping every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        try {
            console.log(`[Keep-Alive] Pinging AI Service: ${AI_SERVICE_URL}`);
            const start = Date.now();
            
            const config = { timeout: 10000 };
            if (process.env.HF_TOKEN) {
                config.headers = { 'Authorization': `Bearer ${process.env.HF_TOKEN}` };
            }

            await axios.get(AI_SERVICE_URL, config);
            
            const duration = Date.now() - start;
            console.log(`[Keep-Alive] Success! Response time: ${duration}ms`);
        } catch (error) {
            console.error(`[Keep-Alive] Failed to ping AI Service: ${error.message}`);
        }
    });
};

export default startKeepAlive;
