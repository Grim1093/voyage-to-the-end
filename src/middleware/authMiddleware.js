const logger = require('../utils/logger');
// Ensure dotenv is loaded so we can read the secret key
require('dotenv').config(); 

const requireAdminKey = (req, res, next) => {
    const context = 'AuthMiddleware';
    logger.info(context, `Step 1: Intercepted request to protected route: ${req.originalUrl}`);

    // Step 2: Extract the custom header
    const providedKey = req.headers['x-admin-key'];

    // Step 3: Check if key is completely missing (Failure Point H)
    if (!providedKey) {
        logger.warn(context, 'Access Denied (Failure Point H): Missing x-admin-key header.');
        return res.status(401).json({ 
            success: false, 
            message: 'Unauthorized: Admin key required.' 
        });
    }

    // Step 4: Check if the server configuration is secure (Failure Point J)
    const VALID_KEY = process.env.ADMIN_API_KEY;
    
    if (!VALID_KEY) {
        logger.error(context, 'CRITICAL FAILURE (Failure Point J): ADMIN_API_KEY is not defined in the .env file!');
        return res.status(500).json({ 
            success: false, 
            message: 'Internal Server Error: Security configuration missing.' 
        });
    }

    // Step 5: Validate the provided key against the secure environment variable (Failure Point I)
    if (providedKey !== VALID_KEY) {
        logger.warn(context, 'Access Denied (Failure Point I): Invalid x-admin-key provided.');
        return res.status(403).json({ 
            success: false, 
            message: 'Forbidden: Invalid admin credentials.' 
        });
    }

    // Step 6: Success. Pass control to the next function
    logger.info(context, 'Step 6: Admin key validated securely via environment variables.');
    next();
};

module.exports = {
    requireAdminKey
};