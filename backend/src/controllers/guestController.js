const crypto = require('crypto');
const db = require('../config/db');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

const registerGuest = async (req, res) => {
    const context = 'GuestController';
    logger.info(context, 'Received new guest registration request.');

    try {
        const { fullName, email, phone, idNumber, idDocumentUrl, dietaryRestrictions } = req.body;

        if (!fullName || !email || !idNumber || !idDocumentUrl) {
            logger.warn(context, `Validation failed. Missing required fields for email: ${email || 'UNKNOWN'}`);
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: fullName, email, idNumber, and idDocumentUrl are mandatory.'
            });
        }

        logger.info(context, `Validation passed for ${email}. Attempting database insertion.`);

        const accessCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        logger.info(context, `Step 2.5: Generated secure access code for guest: ${email}`);

        const insertQuery = `
            INSERT INTO guests (
                full_name, email, phone, id_number, id_document_url, dietary_restrictions, current_state, access_code
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8
            ) RETURNING id, current_state, access_code;
        `;
        const values = [fullName, email, phone, idNumber, idDocumentUrl, dietaryRestrictions, 1, accessCode];

        const result = await db.query(insertQuery, values);
        const newGuest = result.rows[0];

        logger.stateChange(newGuest.id, 0, newGuest.current_state);
        logger.info(context, `Successfully registered guest: ${newGuest.id} with access code.`);

        try {
            logger.info(context, `Step 4.5: Handing off to Email Service to deliver code...`);
            await emailService.sendAccessCode(email, fullName, accessCode); 
            logger.info(context, `Email Service executed.`);
        } catch (emailError) {
            logger.warn(context, `Failure Point Y: Failed to send access code email to ${email}.`, emailError);
        }

        res.status(201).json({
            success: true,
            message: 'Guest successfully registered. Access code generated.',
            guestId: newGuest.id
        });

    } catch (error) {
        if (error.code === '23505') { 
            logger.warn(context, `Registration failed. Email already exists in ledger: ${req.body.email}`);
            return res.status(409).json({
                success: false,
                message: 'A guest with this email is already registered.'
            });
        }

        logger.error(context, 'CRITICAL FAILURE during guest registration.', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration.'
        });
    }
};

const getAllGuests = async (req, res) => {
    const context = 'GuestController - getAllGuests';
    logger.info(context, `Received request to fetch guest ledger. Query params: ${JSON.stringify(req.query)}`);

    try {
        // 1. Dynamic Pagination with Guardrails
        const page = Math.max(1, parseInt(req.query.page) || 1);
        let limit = parseInt(req.query.limit) || 10;
        
        // Safety Caps
        if (limit > 100) {
            logger.warn(context, `Failure Point P1: Requested limit (${limit}) exceeds maximum cap. Defaulting to 100.`);
            limit = 100;
        }
        if (limit < 1) {
            logger.warn(context, `Failure Point P2: Requested limit (${limit}) is invalid. Defaulting to 10.`);
            limit = 10;
        }

        const offset = (page - 1) * limit;

        // 2. Dynamic Query Builder
        let queryValues = [];
        let countQueryValues = [];
        let whereConditions = [];

        // State Filter
        if (req.query.state !== undefined && req.query.state !== '') {
            const stateFilter = parseInt(req.query.state);
            const validStates = [0, 1, 2, -1];
            
            if (!validStates.includes(stateFilter)) {
                logger.warn(context, `Failure Point K: Invalid state filter requested: ${stateFilter}`);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid state filter. Must be 0, 1, 2, or -1.'
                });
            }
            
            // Dynamically assign the next $ variable (e.g., $1)
            whereConditions.push(`current_state = $${queryValues.length + 1}`);
            queryValues.push(stateFilter);
            countQueryValues.push(stateFilter);
            logger.info(context, `Applying state filter: State ${stateFilter}`);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Add Pagination Params to fetch query dynamically
        queryValues.push(limit);
        const limitParamIndex = queryValues.length;
        
        queryValues.push(offset);
        const offsetParamIndex = queryValues.length;

        const fetchQuery = `
            SELECT id, full_name, email, current_state, created_at 
            FROM guests 
            ${whereClause}
            ORDER BY created_at DESC 
            LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex};
        `;
        
        const countQuery = `SELECT COUNT(*) FROM guests ${whereClause};`;

        // 3. Execution
        logger.info(context, `Executing fetch query with limit ${limit} and offset ${offset}.`);
        const result = await db.query(fetchQuery, queryValues);
        
        logger.info(context, `Executing count query to determine total pages.`);
        const countResult = await db.query(countQuery, countQueryValues);
        
        const totalGuests = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalGuests / limit);

        res.status(200).json({
            success: true,
            message: 'Guests retrieved successfully.',
            data: result.rows,
            pagination: { 
                currentPage: page, 
                limit: limit,
                totalPages: totalPages, 
                totalGuests: totalGuests 
            }
        });

    } catch (error) {
        logger.error(context, 'Failure Point P3: CRITICAL FAILURE during guest retrieval.', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const updateGuestState = async (req, res) => {
    const context = 'GuestController';
    const guestId = req.params.id;
    
    try {
        const { newState, errorLog } = req.body;
        const validStates = [0, 1, 2, -1];
        
        if (!validStates.includes(newState)) {
            return res.status(400).json({ success: false, message: 'Invalid state value.' });
        }

        const checkQuery = `SELECT current_state FROM guests WHERE id = $1;`;
        const checkResult = await db.query(checkQuery, [guestId]);

        if (checkResult.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Guest not found.' });
        }

        const currentState = checkResult.rows[0].current_state;
        
        const updateQuery = `
            UPDATE guests 
            SET current_state = $1, error_log = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3 
            RETURNING id, current_state;
        `;
        const logEntry = newState === -1 ? errorLog : null;
        const updateResult = await db.query(updateQuery, [newState, logEntry, guestId]);
        const updatedGuest = updateResult.rows[0];

        logger.stateChange(updatedGuest.id, currentState, updatedGuest.current_state);

        res.status(200).json({ success: true, data: updatedGuest });

    } catch (error) {
        logger.error(context, `CRITICAL FAILURE during state update for guest ID: ${guestId}`, error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const guestLogin = async (req, res) => {
    const context = 'GuestController - Login';
    logger.info(context, 'Received guest login attempt.');

    try {
        const { email, accessCode } = req.body;

        if (!email || !accessCode) {
            logger.warn(context, 'Failure Point AA: Login failed. Missing email or access code.');
            return res.status(400).json({
                success: false,
                message: 'Email and access code are required.'
            });
        }

        logger.info(context, `Step 2: Querying ledger for email: ${email}`);
        
        // --- NEW: EXPANDED PAYLOAD TO INCLUDE PHONE AND DIETARY RESTRICTIONS ---
        const query = `
            SELECT id, full_name, current_state, id_document_url, access_code, phone, dietary_restrictions 
            FROM guests 
            WHERE email = $1;
        `;
        const result = await db.query(query, [email]);

        if (result.rowCount === 0) {
            logger.warn(context, `Failure Point BB: Login failed. Email not found: ${email}`);
            return res.status(401).json({ success: false, message: 'Invalid email or access code.' });
        }

        const guest = result.rows[0];

        if (guest.access_code !== accessCode.trim().toUpperCase()) {
            logger.warn(context, `Failure Point BB: Login failed. Invalid access code for: ${email}`);
            return res.status(401).json({ success: false, message: 'Invalid email or access code.' });
        }

        logger.info(context, `Step 4: Successful login for guest: ${guest.id}`);
        const { access_code, ...safeGuestData } = guest;

        res.status(200).json({
            success: true,
            message: 'Login successful.',
            data: safeGuestData
        });

    } catch (error) {
        logger.error(context, 'CRITICAL FAILURE during guest login.', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login.'
        });
    }
};

const getGuestStatus = async (req, res) => {
    const context = 'GuestController - Status Sync';
    const guestId = req.params.id;
    
    logger.info(context, `Step 1: Received live status request for guest ID: ${guestId}`);

    try {
        const query = `SELECT current_state FROM guests WHERE id = $1;`;
        const result = await db.query(query, [guestId]);

        if (result.rowCount === 0) {
            logger.warn(context, `Failure Point FF: Status check failed. Guest not found: ${guestId}`);
            return res.status(404).json({ success: false, message: 'Guest not found.' });
        }

        const currentState = result.rows[0].current_state;
        logger.info(context, `Step 2: Successfully retrieved live state (${currentState}) for guest: ${guestId}`);

        res.status(200).json({
            success: true,
            currentState: currentState
        });

    } catch (error) {
        logger.error(context, `CRITICAL FAILURE during status sync for guest ID: ${guestId}`, error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during status sync.'
        });
    }
};

module.exports = {
    registerGuest,
    getAllGuests,
    updateGuestState,
    guestLogin,
    getGuestStatus 
};