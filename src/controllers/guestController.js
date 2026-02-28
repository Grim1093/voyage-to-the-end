const crypto = require('crypto'); // NEW: For secure code generation
const db = require('../config/db');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

const registerGuest = async (req, res) => {
    const context = 'GuestController';
    logger.info(context, 'Received new guest registration request.');

    try {
        // Step 1: Extract data from the incoming request body
        const { fullName, email, phone, idNumber, idDocumentUrl, dietaryRestrictions } = req.body;

        // Step 2: Input Validation (Failure Point B)
        if (!fullName || !email || !idNumber || !idDocumentUrl) {
            logger.warn(context, `Validation failed. Missing required fields for email: ${email || 'UNKNOWN'}`);
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: fullName, email, idNumber, and idDocumentUrl are mandatory.'
            });
        }

        logger.info(context, `Validation passed for ${email}. Attempting database insertion.`);

        // Step 2.5: Generate Secure Access Code
        // crypto.randomBytes(3) generates 3 bytes, which becomes 6 hex characters.
        const accessCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        logger.info(context, `Step 2.5: Generated secure access code for guest: ${email}`);

        // Step 3: Parameterized SQL Query (Updated with access_code)
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

        // Step 4: State Change Logging
        logger.stateChange(newGuest.id, 0, newGuest.current_state);
        logger.info(context, `Successfully registered guest: ${newGuest.id} with access code.`);

        // Step 4.5: Trigger Email Service (Failure Point Y)
        try {
            logger.info(context, `Step 4.5: Handing off to Email Service to deliver code...`);
            await emailService.sendAccessCode(email, fullName, accessCode); 
            logger.info(context, `Email Service placeholder executed.`);
        } catch (emailError) {
            // We log the failure but DO NOT crash the registration. The guest is still in the database.
            logger.warn(context, `Failure Point Y: Failed to send access code email to ${email}.`, emailError);
        }

        res.status(201).json({
            success: true,
            message: 'Guest successfully registered. Access code generated.',
            guestId: newGuest.id
        });

    } catch (error) {
        // Step 5: Catch Database Errors
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

// --- NEW PAGINATED & FILTERED READ PIPELINE ---
const getAllGuests = async (req, res) => {
    const context = 'GuestController';
    logger.info(context, `Received request to fetch guest ledger. Query params: ${JSON.stringify(req.query)}`);

    try {
        // Step 1: Pagination Math (Failure Point C)
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        // Step 2: State Filtering Logic (Failure Point K)
        let stateFilter = req.query.state;
        let queryValues = [];
        let countQueryValues = [];
        let whereClause = '';

        // If the admin provided a ?state= parameter
        if (stateFilter !== undefined) {
            stateFilter = parseInt(stateFilter);
            const validStates = [0, 1, 2, -1];
            
            if (!validStates.includes(stateFilter)) {
                logger.warn(context, `Validation failed (Failure Point K). Invalid state filter requested: ${stateFilter}`);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid state filter. Must be 0, 1, 2, or -1.'
                });
            }
            
            logger.info(context, `Applying state filter: Only fetching guests in State ${stateFilter}`);
            whereClause = 'WHERE current_state = $1';
            queryValues.push(stateFilter);
            countQueryValues.push(stateFilter);
        } else {
            logger.info(context, 'No state filter applied. Fetching all guests.');
        }

        queryValues.push(limit, offset);

        const limitParam = stateFilter !== undefined ? '$2' : '$1';
        const offsetParam = stateFilter !== undefined ? '$3' : '$2';

        // Step 3: Fetching the Data (Failure Point D)
        logger.info(context, 'Executing dynamic database query to fetch guests...');
        const fetchQuery = `
            SELECT id, full_name, email, current_state, created_at 
            FROM guests 
            ${whereClause}
            ORDER BY created_at DESC 
            LIMIT ${limitParam} OFFSET ${offsetParam};
        `;
        
        const result = await db.query(fetchQuery, queryValues);
        logger.info(context, `Successfully retrieved ${result.rowCount} guests from the database.`);

        // Step 4: Fetching Metadata for Pagination
        logger.info(context, 'Fetching total guest count for pagination metadata...');
        const countQuery = `SELECT COUNT(*) FROM guests ${whereClause};`;
        const countResult = await db.query(countQuery, countQueryValues);
        
        const totalGuests = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalGuests / limit);
        logger.info(context, `Total matching guests in ledger: ${totalGuests}. Total pages: ${totalPages}.`);

        // Step 5: Return payload
        res.status(200).json({
            success: true,
            message: 'Guests retrieved successfully.',
            data: result.rows,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalGuests: totalGuests
            }
        });
        logger.info(context, 'GET response successfully sent to client.');

    } catch (error) {
        logger.error(context, 'CRITICAL FAILURE during guest retrieval.', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during data retrieval.'
        });
    }
};

// --- NEW VERIFICATION PIPELINE (STATE TRANSITIONS) ---
const updateGuestState = async (req, res) => {
    const context = 'GuestController';
    const guestId = req.params.id;
    
    logger.info(context, `Step 1: Received state update request for guest ID: ${guestId}`);

    try {
        const { newState, errorLog } = req.body;

        // Step 2: Input Validation (Failure Point E)
        logger.info(context, `Step 2: Validating requested state transition payload. Requested state: ${newState}`);
        const validStates = [0, 1, 2, -1];
        
        if (!validStates.includes(newState)) {
            logger.warn(context, `Validation failed at Step 2. Invalid state requested: ${newState}`);
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid state value. Must be 0, 1, 2, or -1.' 
            });
        }

        // Step 3: Verify Guest Exists (Failure Point F)
        logger.info(context, `Step 3: Querying ledger to verify guest exists and fetch current state.`);
        const checkQuery = `SELECT current_state FROM guests WHERE id = $1;`;
        const checkResult = await db.query(checkQuery, [guestId]);

        if (checkResult.rowCount === 0) {
            logger.warn(context, `Lookup failed at Step 3. UUID not found in database: ${guestId}`);
            return res.status(404).json({ 
                success: false, 
                message: 'Guest not found.' 
            });
        }

        const currentState = checkResult.rows[0].current_state;

        // Step 4: Execute Database Update (Failure Point G)
        logger.info(context, `Step 4: Executing PostgreSQL UPDATE to transition state from ${currentState} to ${newState}.`);
        
        const updateQuery = `
            UPDATE guests 
            SET current_state = $1, error_log = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3 
            RETURNING id, current_state;
        `;
        const logEntry = newState === -1 ? errorLog : null;
        
        const updateResult = await db.query(updateQuery, [newState, logEntry, guestId]);
        const updatedGuest = updateResult.rows[0];

        // Step 5: Log the official state transition
        logger.stateChange(updatedGuest.id, currentState, updatedGuest.current_state);
        logger.info(context, `Step 5: Successfully committed state transition for guest: ${updatedGuest.id}`);

        res.status(200).json({
            success: true,
            message: 'Guest state successfully updated.',
            data: updatedGuest
        });

    } catch (error) {
        logger.error(context, `CRITICAL FAILURE at Step 6 during state update for guest ID: ${guestId}`, error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during state update.'
        });
    }
};

module.exports = {
    registerGuest,
    getAllGuests,
    updateGuestState
};