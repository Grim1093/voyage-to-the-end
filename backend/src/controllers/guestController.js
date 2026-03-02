const crypto = require('crypto');
const db = require('../config/db');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

// Helper to map the URL slug to the database internal ID
const getEventIdBySlug = async (slug, context) => {
    const result = await db.query('SELECT id FROM events WHERE slug = $1', [slug]);
    if (result.rowCount === 0) {
        logger.warn(context, `Failure Point E1: Event slug not found in database: ${slug}`);
        return null;
    }
    return result.rows[0].id;
};

const registerGuest = async (req, res) => {
    const context = 'GuestController - Register';
    const eventSlug = req.params.eventSlug;
    logger.info(context, `Received new registration request for event: ${eventSlug}`);

    try {
        const eventId = await getEventIdBySlug(eventSlug, context);
        if (!eventId) {
            return res.status(404).json({ success: false, message: 'Event not found.' });
        }

        const { fullName, email, phone, idNumber, idDocumentUrl, dietaryRestrictions } = req.body;

        if (!fullName || !email || !idNumber || !idDocumentUrl) {
            logger.warn(context, `Failure Point E2: Validation failed. Missing fields for email: ${email || 'UNKNOWN'}`);
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: fullName, email, idNumber, and idDocumentUrl are mandatory.'
            });
        }

        // Multi-Tenant Isolation: Check if this email is already registered FOR THIS SPECIFIC EVENT
        const checkDuplicateQuery = `SELECT id FROM guests WHERE email = $1 AND event_id = $2;`;
        const duplicateCheck = await db.query(checkDuplicateQuery, [email, eventId]);
        
        if (duplicateCheck.rowCount > 0) {
            logger.warn(context, `Failure Point E3: Registration failed. Email already exists in event ledger: ${email}`);
            return res.status(409).json({
                success: false,
                message: 'A guest with this email is already registered for this event.'
            });
        }

        const accessCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        logger.info(context, `Step 3: Generated secure access code for guest: ${email}`);

        const insertQuery = `
            INSERT INTO guests (
                full_name, email, phone, id_number, id_document_url, dietary_restrictions, current_state, access_code, event_id
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9
            ) RETURNING id, current_state, access_code;
        `;
        const values = [fullName, email, phone, idNumber, idDocumentUrl, dietaryRestrictions, 1, accessCode, eventId];

        const result = await db.query(insertQuery, values);
        const newGuest = result.rows[0];

        logger.stateChange(newGuest.id, 0, newGuest.current_state);
        logger.info(context, `Successfully registered guest: ${newGuest.id} under event ID: ${eventId}`);

        try {
            await emailService.sendAccessCode(email, fullName, accessCode); 
            logger.info(context, `Email Service executed.`);
        } catch (emailError) {
            logger.warn(context, `Failure Point Y: Failed to send access code email to ${email}.`, emailError);
        }

        res.status(201).json({
            success: true,
            message: 'Guest successfully registered.',
            guestId: newGuest.id
        });

    } catch (error) {
        logger.error(context, 'Failure Point E4: CRITICAL FAILURE during guest registration.', error);
        res.status(500).json({ success: false, message: 'Internal server error during registration.' });
    }
};

const getAllGuests = async (req, res) => {
    const context = 'GuestController - getAllGuests';
    const eventSlug = req.params.eventSlug;

    try {
        const eventId = await getEventIdBySlug(eventSlug, context);
        if (!eventId) return res.status(404).json({ success: false, message: 'Event not found.' });

        const page = Math.max(1, parseInt(req.query.page) || 1);
        let limit = parseInt(req.query.limit) || 10;
        
        if (limit > 100) limit = 100;
        if (limit < 1) limit = 10;

        const offset = (page - 1) * limit;

        let queryValues = [eventId];
        let countQueryValues = [eventId];
        let whereConditions = ['event_id = $1'];

        if (req.query.state !== undefined && req.query.state !== '') {
            const stateFilter = parseInt(req.query.state);
            const validStates = [0, 1, 2, -1];
            
            if (!validStates.includes(stateFilter)) {
                logger.warn(context, `Failure Point K: Invalid state filter: ${stateFilter}`);
                return res.status(400).json({ success: false, message: 'Invalid state filter.' });
            }
            
            whereConditions.push(`current_state = $${queryValues.length + 1}`);
            queryValues.push(stateFilter);
            countQueryValues.push(stateFilter);
        }

        const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

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

        const result = await db.query(fetchQuery, queryValues);
        const countResult = await db.query(countQuery, countQueryValues);
        
        const totalGuests = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalGuests / limit);

        res.status(200).json({
            success: true,
            data: result.rows,
            pagination: { currentPage: page, limit, totalPages, totalGuests }
        });

    } catch (error) {
        logger.error(context, 'Failure Point P3: CRITICAL FAILURE during guest retrieval.', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const updateGuestState = async (req, res) => {
    const context = 'GuestController - updateState';
    const guestId = req.params.id;
    const eventSlug = req.params.eventSlug;
    
    try {
        const eventId = await getEventIdBySlug(eventSlug, context);
        if (!eventId) return res.status(404).json({ success: false, message: 'Event not found.' });

        const { newState, errorLog } = req.body;
        if (![0, 1, 2, -1].includes(newState)) {
            return res.status(400).json({ success: false, message: 'Invalid state value.' });
        }

        const checkQuery = `SELECT current_state FROM guests WHERE id = $1 AND event_id = $2;`;
        const checkResult = await db.query(checkQuery, [guestId, eventId]);

        if (checkResult.rowCount === 0) {
            logger.warn(context, `Failure Point E5: IDOR Attempt or missing guest. Guest: ${guestId}, Event: ${eventId}`);
            return res.status(404).json({ success: false, message: 'Guest not found in this event ledger.' });
        }

        const currentState = checkResult.rows[0].current_state;
        
        const updateQuery = `
            UPDATE guests 
            SET current_state = $1, error_log = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3 AND event_id = $4
            RETURNING id, current_state;
        `;
        const logEntry = newState === -1 ? errorLog : null;
        const updateResult = await db.query(updateQuery, [newState, logEntry, guestId, eventId]);
        const updatedGuest = updateResult.rows[0];

        logger.stateChange(updatedGuest.id, currentState, updatedGuest.current_state);
        res.status(200).json({ success: true, data: updatedGuest });

    } catch (error) {
        logger.error(context, `Failure Point E6: CRITICAL FAILURE updating state.`, error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const guestLogin = async (req, res) => {
    const context = 'GuestController - Login';
    const eventSlug = req.params.eventSlug;

    try {
        const eventId = await getEventIdBySlug(eventSlug, context);
        if (!eventId) return res.status(404).json({ success: false, message: 'Event not found.' });

        const { email, accessCode } = req.body;
        if (!email || !accessCode) {
            return res.status(400).json({ success: false, message: 'Email and access code are required.' });
        }

        const query = `
            SELECT id, full_name, current_state, id_document_url, access_code, phone, dietary_restrictions 
            FROM guests 
            WHERE email = $1 AND event_id = $2;
        `;
        const result = await db.query(query, [email, eventId]);

        if (result.rowCount === 0 || result.rows[0].access_code !== accessCode.trim().toUpperCase()) {
            logger.warn(context, `Failure Point BB: Login failed for ${email} at event ${eventSlug}`);
            return res.status(401).json({ success: false, message: 'Invalid email or access code.' });
        }

        const { access_code, ...safeGuestData } = result.rows[0];
        res.status(200).json({ success: true, data: safeGuestData });

    } catch (error) {
        logger.error(context, 'Failure Point E7: CRITICAL FAILURE during login.', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const getGuestStatus = async (req, res) => {
    const context = 'GuestController - Status Sync';
    const guestId = req.params.id;
    const eventSlug = req.params.eventSlug;

    try {
        const eventId = await getEventIdBySlug(eventSlug, context);
        if (!eventId) return res.status(404).json({ success: false, message: 'Event not found.' });

        const query = `SELECT current_state FROM guests WHERE id = $1 AND event_id = $2;`;
        const result = await db.query(query, [guestId, eventId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Guest not found.' });
        }

        res.status(200).json({ success: true, currentState: result.rows[0].current_state });

    } catch (error) {
        logger.error(context, `Failure Point FF: CRITICAL FAILURE during status sync.`, error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

// ARCHITECT NOTE: New Lazy-Loading Function for the Admin "Inspect" Vault
const getGuestById = async (req, res) => {
    const context = 'GuestController - getGuestById';
    const guestId = req.params.id;
    const eventSlug = req.params.eventSlug;

    logger.info(context, `Fetching extended details for guest ID: ${guestId}`);

    try {
        const eventId = await getEventIdBySlug(eventSlug, context);
        if (!eventId) return res.status(404).json({ success: false, message: 'Event not found.' });

        const query = `
            SELECT id, full_name, email, phone, id_number, id_document_url, dietary_restrictions, current_state, created_at 
            FROM guests 
            WHERE id = $1 AND event_id = $2;
        `;
        const result = await db.query(query, [guestId, eventId]);

        if (result.rowCount === 0) {
            logger.warn(context, `Failure Point G8: Guest not found for ID: ${guestId}`);
            return res.status(404).json({ success: false, message: 'Guest not found.' });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        logger.error(context, `Failure Point G9: CRITICAL FAILURE fetching extended details for guest ${guestId}.`, error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

module.exports = {
    registerGuest,
    getAllGuests,
    updateGuestState,
    guestLogin,
    getGuestStatus,
    getGuestById 
};