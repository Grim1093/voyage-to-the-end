const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const logger = require('../utils/logger');

const adminLogin = async (req, res) => {
    const context = 'AuthController - adminLogin';
    logger.info(context, 'Step 1: Inbound login request detected. Initiating Vault verification protocol...');

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            logger.warn(context, 'Failure Point Auth-1: Malformed login payload. Missing credentials.');
            return res.status(400).json({ success: false, message: 'Email and password are strictly required.' });
        }

        // [Architecture] Step 2: Query the Global Ledger for the Admin identity
        const query = `SELECT id, email, password_hash FROM admins WHERE email = $1;`;
        const result = await db.query(query, [email]);

        if (result.rowCount === 0) {
            // SECURITY NOTE: We do not tell the client "Email not found". 
            // We use a generic error to prevent attackers from enumerating valid admin emails.
            logger.warn(context, `Failure Point Auth-2: Unrecognized identity attempted breach: ${email}`);
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const admin = result.rows[0];

        // [Architecture] Step 3: Cryptographic Hash Verification
        logger.info(context, `Step 3: Identity located. Computing cryptographic hash comparison for ${email}...`);
        const isMatch = await bcrypt.compare(password, admin.password_hash);

        if (!isMatch) {
            logger.warn(context, `Failure Point Auth-3: Cryptographic signature mismatch for ${email}. Access violently rejected.`);
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        // [Architecture] Step 4: Minting the JSON Web Token
        // We embed the role and ID, and sign it with the Master Secret.
        if (!process.env.JWT_SECRET) {
            logger.error(context, 'CRITICAL FAILURE: JWT_SECRET is missing from the Control Plane environment.');
            return res.status(500).json({ success: false, message: 'Internal server configuration error.' });
        }

        logger.info(context, 'Step 4: Hash verified. Minting authorization token...');
        const tokenPayload = {
            id: admin.id,
            email: admin.email,
            role: 'superadmin' // Explicit RBAC assignment
        };

        // Token expires in 24 hours to enforce security hygiene
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '24h' });

        logger.info(context, `Step 5: SUCCESS. Master Control Plane unlocked for ${email}.`);

        res.status(200).json({
            success: true,
            message: 'Authentication successful.',
            token: token,
            admin: {
                id: admin.id,
                email: admin.email
            }
        });

    } catch (error) {
        logger.error(context, 'Failure Point Auth-Crit: CRITICAL FAILURE during login sequence.', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

module.exports = {
    adminLogin
};