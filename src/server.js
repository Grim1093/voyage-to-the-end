require('dotenv').config();
const express = require('express');
const { connectDB } = require('./config/db');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: This allows our server to read JSON data sent from the frontend forms
app.use(express.json());

// Mount the Router (Wiring the Brain to the URL)
const guestRoutes = require('./routes/guestRoutes');
app.use('/api/guests', guestRoutes);
logger.info('Server', 'Mounted guest routes at /api/guests');

// Failure Point / DevOps Check: A simple route to verify the server is running
app.get('/health', (req, res) => {
    logger.info('Server', 'Health check endpoint accessed.');
    res.status(200).json({ status: 'OK', message: 'MICE Guest Ledger API is running.' });
});

// Boot Sequence
const startServer = async () => {
    try {
        logger.info('Server', 'Starting boot sequence...');
        
        // Step 1: Connect to the Database (Our Failure Point 0)
        // If this fails, the catch block below triggers instantly.
        await connectDB();
        
        // Step 2: Start listening for HTTP requests
        app.listen(PORT, () => {
            logger.info('Server', `Boot sequence complete. API is listening on port ${PORT}`);
        });
        
    } catch (error) {
        logger.error('Server', 'CRITICAL FAILURE during boot sequence.', error);
        // Exit the process if the server cannot boot properly
        process.exit(1);
    }
};

// Execute the boot sequence
startServer();