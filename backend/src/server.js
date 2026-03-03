require('dotenv').config();
const express = require('express');
const { connectDB } = require('./config/db');
const cors = require('cors');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// --- SECURITY MIDDLEWARE ---
// Step 1: Configure CORS to strictly allow our Next.js frontend
const corsOptions = {
    // ARCHITECT NOTE: Upgraded to look for a production environment variable first!
    origin: process.env.FRONTEND_URL || 'http://localhost:3001', 
    // ARCHITECT NOTE: The Bouncer is now instructed to allow DELETE protocols
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'x-admin-key'], 
};

// Apply the CORS barrier
app.use(cors(corsOptions));
logger.info('ServerBoot', `CORS middleware configured. Allowed origin: ${process.env.FRONTEND_URL || 'http://localhost:3001'}`);

// Middleware: This allows our server to read JSON data sent from the frontend forms
app.use(express.json());
logger.info('ServerBoot', 'Step 1: JSON body parser engaged.');

// Mount the Routers (Wiring the Brain to the URL)
const guestRoutes = require('./routes/guestRoutes');
app.use('/api/guests', guestRoutes);
logger.info('ServerBoot', 'Step 2: Mounted guest node routing at /api/guests');

// Mounting our new Event Management Engine
const eventRoutes = require('./routes/eventRoutes');
app.use('/api/events', eventRoutes);
logger.info('ServerBoot', 'Step 3: Mounted master event routing at /api/events');

// Failure Point / DevOps Check: A simple route to verify the server is running
app.get('/health', (req, res) => {
    logger.info('ServerHealth', 'Uptime health check endpoint pinged.');
    res.status(200).json({ status: 'OK', message: 'MICE Guest Ledger API is running dynamically.' });
});

// Boot Sequence
const startServer = async () => {
    try {
        logger.info('ServerBoot', 'Step 4: Initiating main ignition sequence...');
        
        // Connect to the Database (Our Failure Point 0)
        // If this fails, the catch block below triggers instantly.
        await connectDB();
        logger.info('ServerBoot', 'Step 5: Database uplink established.');
        
        // Start listening for HTTP requests
        app.listen(PORT, () => {
            logger.info('ServerBoot', `Step 6: Ignition complete. Master Control Plane is actively listening on port ${PORT}`);
        });
        
    } catch (error) {
        logger.error('ServerBoot', 'CRITICAL FAILURE Point 0: Boot sequence aborted.', error);
        // Exit the process if the server cannot boot properly
        process.exit(1);
    }
};

// Execute the boot sequence
startServer();