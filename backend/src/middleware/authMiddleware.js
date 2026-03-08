const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
// [Architecture] Required to verify the active session lock
const { redisClient } = require('../config/cache'); 
require('dotenv').config(); 

const requireAdminKey = async (req, res, next) => {
    const context = 'AuthMiddleware - Admin';
    logger.info(context, `Step 1: Intercepted request to protected admin route: ${req.originalUrl}`);

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.warn(context, 'Access Denied (Failure Point H): Missing or malformed Bearer token.');
        return res.status(401).json({ 
            success: false, 
            message: 'Unauthorized: Cryptographic token required.' 
        });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        logger.error(context, 'CRITICAL FAILURE (Failure Point J): JWT_SECRET is not defined in the Control Plane environment!');
        return res.status(500).json({ 
            success: false, 
            message: 'Internal Server Error: Security configuration missing.' 
        });
    }

    try {
        const decoded = jwt.verify(token, secret);

        if (decoded.role !== 'superadmin') {
            logger.warn(context, `Access Denied (Failure Point K): Valid token, but insufficient privileges for ${decoded.email}.`);
            return res.status(403).json({ 
                success: false, 
                message: 'Forbidden: Insufficient clearance.' 
            });
        }

        // [Architecture] Step 1.5: "Last-In" Concurrent Session Validation
        if (redisClient) {
            const sessionKey = `admin_session:${decoded.id}`;
            const activeSessionId = await redisClient.get(sessionKey);

            // If the token's session ID doesn't match Valkey, or Valkey is empty (logged out)
            if (!activeSessionId || activeSessionId !== decoded.session_id) {
                logger.warn(context, `SECURITY TRIGGER: Revoked token detected for ${decoded.email}. Session was overridden by a newer login.`);
                return res.status(401).json({
                    success: false,
                    message: 'Session Expired: You have logged in from another device. Please authenticate again.'
                });
            }
        }

        logger.info(context, `Step 6: Signature verified. Access granted to Superadmin: ${decoded.email}`);
        req.admin = decoded;
        next();

    } catch (error) {
        logger.warn(context, `Access Denied (Failure Point I): Token verification failed - ${error.message}`);
        return res.status(403).json({ 
            success: false, 
            message: 'Forbidden: Invalid or expired token.' 
        });
    }
};

// ARCHITECTURE: The Guest Bouncer with IDOR Protection
const requireGuestToken = (req, res, next) => {
    const context = 'AuthMiddleware - Guest';
    logger.info(context, `Step 1: Intercepted request to protected guest portal route: ${req.originalUrl}`);

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.warn(context, 'Access Denied: Missing or malformed Bearer token.');
        return res.status(401).json({ 
            success: false, 
            message: 'Unauthorized: Cryptographic token required.' 
        });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    try {
        const decoded = jwt.verify(token, secret);

        if (decoded.role !== 'guest') {
            logger.warn(context, `Access Denied: Invalid role clearance. Expected 'guest', received '${decoded.role}'.`);
            return res.status(403).json({ 
                success: false, 
                message: 'Forbidden: Insufficient clearance.' 
            });
        }

        // [Architecture] Anti-IDOR Shield: Ensure guests can only access their own specific data payloads
        if (req.params.id && req.params.id !== decoded.id) {
            logger.warn(context, `CRITICAL SECURITY EVENT: IDOR Attempt Blocked. Token ID [${decoded.id}] attempted to access Route ID [${req.params.id}].`);
            return res.status(403).json({ 
                success: false, 
                message: 'Forbidden: Cross-account access violently rejected.' 
            });
        }

        logger.info(context, `Step 2: Signature verified. Access granted to Guest ID: ${decoded.id}`);
        req.guest = decoded;
        next();

    } catch (error) {
        logger.warn(context, `Access Denied: Token verification failed - ${error.message}`);
        return res.status(401).json({ 
            success: false, 
            message: 'Unauthorized: Invalid or expired session. Please log in again.' 
        });
    }
};

module.exports = {
    requireAdminKey,
    requireGuestToken
};