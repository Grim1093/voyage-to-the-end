require('dotenv').config();
const express = require('express');
const { connectDB } = require('./config/db');
const cors = require('cors');
const logger = require('./utils/logger'); // Assuming this is your custom winston/pino logger

console.log('[ServerBoot] Step 1: Initiating Master Control Plane boot sequence...');

const app = express();
const PORT = process.env.PORT || 3000;

// --- SECURITY MIDDLEWARE ---
console.log('[Security] Step 2: Configuring Dynamic CORS Origin Gateway...');

// ARCHITECT NOTE: Static origins for Local Dev and Master Production URL
const staticAllowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL 
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Condition 1: Allow server-to-server or non-browser requests (no origin)
        if (!origin) {
            return callback(null, true);
        }

        // Condition 2: Exact string match against our static whitelist
        if (staticAllowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Condition 3: Dynamic RegEx match for Vercel Preview Deployments
        // This regex ensures it strictly starts with https://voyage-to-the-end and ends with .vercel.app
        const isVercelPreview = /^https:\/\/voyage-to-the-end.*\.vercel\.app$/.test(origin);

        if (isVercelPreview) {
            console.log(`[Security] Step 2.1: Authorized dynamic Vercel preview branch: ${origin}`);
            return callback(null, true);
        }

        // Condition 4: Total Rejection
        console.error(`[Security] Failure Point A: Blocked unauthorized CORS request. Origin not in whitelist or preview pattern: ${origin}`);
        callback(new Error('Origin completely unauthorized by CORS Bouncer.'));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-admin-key', 'Authorization'], 
    credentials: true 
};

app.use(cors(corsOptions));
console.log(`[Security] Step 3: CORS gateway engaged. Static Whitelist configured + Vercel Preview RegEx active.`);

app.use(express.json());
console.log('[ServerBoot] Step 4: JSON body parser active.');

// --- ROUTER MOUNTING ---
try {
    const guestRoutes = require('./routes/guestRoutes');
    app.use('/api/guests', guestRoutes);
    console.log('[Router] Step 5: Guest Node routing mounted at /api/guests');

    const eventRoutes = require('./routes/eventRoutes');
    app.use('/api/events', eventRoutes);
    console.log('[Router] Step 6: Master Event routing mounted at /api/events');
} catch (error) {
    console.error('[Router] Failure Point B: Failed to mount routing modules.', error);
    process.exit(1);
}

// --- TELEMETRY & HEALTH ---
app.get('/health', (req, res) => {
    console.log('[ServerHealth] Uptime check pinged from external source.');
    res.status(200).json({ status: 'OK', message: 'MICE Node API is operational.' });
});

// --- IGNITION SEQUENCE ---
const startServer = async () => {
    try {
        console.log('[Database] Step 7: Attempting connection to PostgreSQL Global Ledger...');
        await connectDB();
        console.log('[Database] Step 8: Ledger uplink established successfully.');
        
        app.listen(PORT, () => {
            console.log(`[ServerBoot] Step 9: Ignition complete. Nexus Control Plane listening on port ${PORT}`);
        });
        
    } catch (error) {
        console.error('[Database] CRITICAL Failure Point 0: Database connection rejected. Aborting boot sequence.', error);
        process.exit(1);
    }
};

startServer();
