const crypto = require('crypto');
const db = require('../config/db');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

// ARCHITECT NOTE: Upgraded helper to return both ID and Name to support dynamic multi-tenant emails.
const getEventBySlug = async (slug, context) => {
    const result = await db.query('SELECT id, name FROM events WHERE slug = $1', [slug]);
    if (result.rowCount === 0) {
        logger.warn(context, `Failure Point E1: Event slug not found in database: ${slug}`);
        return null;
    }
    return {
        id: result.rows[0].id,
        name: result.rows[0].name
    };
};

// ARCHITECT NOTE: The New Global Guest Fetcher
const getGlobalGuests = async (req, res) => {
    const context = 'GuestController - getGlobalGuests';
    logger.info(context, 'Master Admin fetching Global Guest Directory.');

    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        let limit = parseInt(req.query.limit) || 10;
        if (limit > 100) limit = 100;
        
        const offset = (page - 1) * limit;

        // Uses JSON_AGG to bundle all a guest's events into an array
        const fetchQuery = `
            SELECT 
                g.id, 
                g.full_name, 
                g.email, 
                g.phone,
                g.created_at,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'title', e.name,
                            'slug', e.slug,
                            'state', er.current_state
                        )
                    ) FILTER (WHERE e.id IS NOT NULL), '[]'
                ) as registered_events
            FROM guests g
            LEFT JOIN event_registrations er ON g.id = er.guest_id
            LEFT JOIN events e ON er.event_id = e.id
            GROUP BY g.id
            ORDER BY g.created_at DESC
            LIMIT $1 OFFSET $2;
        `;
        
        const countQuery = `SELECT COUNT(*) FROM guests;`;

        const result = await db.query(fetchQuery, [limit, offset]);
        const countResult = await db.query(countQuery);
        
        const totalGuests = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalGuests / limit);

        res.status(200).json({
            success: true,
            data: result.rows,
            pagination: { currentPage: page, limit, totalPages, totalGuests }
        });

    } catch (error) {
        logger.error(context, 'Failure Point G10: CRITICAL FAILURE fetching global guests.', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const registerGuest = async (req, res) => {
    const context = 'GuestController - Register';
    const eventSlug = req.params.eventSlug;
    logger.info(context, `Received new registration request for event: ${eventSlug}`);

    try {
        const event = await getEventBySlug(eventSlug, context);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found.' });
        }
        
        const eventId = event.id;
        const eventName = event.name;

        const { fullName, email, phone, idNumber, idDocumentUrl, dietaryRestrictions } = req.body;

        if (!fullName || !email || !idNumber || !idDocumentUrl) {
            logger.warn(context, `Failure Point E2: Validation failed. Missing fields for email: ${email || 'UNKNOWN'}`);
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: fullName, email, idNumber, and idDocumentUrl are mandatory.'
            });
        }

        let guestId;
        const findGuestQuery = `SELECT id FROM guests WHERE email = $1;`;
        const guestResult = await db.query(findGuestQuery, [email]);

        if (guestResult.rowCount > 0) {
            guestId = guestResult.rows[0].id;
            logger.info(context, `Step 1: Found existing global identity for ${email} (ID: ${guestId})`);
        } else {
            const insertGuestQuery = `
                INSERT INTO guests (full_name, email, phone) 
                VALUES ($1, $2, $3) RETURNING id;
            `;
            const newGuestResult = await db.query(insertGuestQuery, [fullName, email, phone]);
            guestId = newGuestResult.rows[0].id;
            logger.info(context, `Step 1: Created new global identity for ${email} (ID: ${guestId})`);
        }

        const checkDuplicateQuery = `SELECT id FROM event_registrations WHERE guest_id = $1 AND event_id = $2;`;
        const duplicateCheck = await db.query(checkDuplicateQuery, [guestId, eventId]);
        
        if (duplicateCheck.rowCount > 0) {
            logger.warn(context, `Failure Point E3: Registration failed. Guest already has a ticket for this event: ${email}`);
            return res.status(409).json({
                success: false,
                message: 'You are already registered for this specific event.'
            });
        }

        const accessCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        logger.info(context, `Step 2: Generated secure access code for registration: ${accessCode}`);

        const insertRegQuery = `
            INSERT INTO event_registrations (
                guest_id, event_id, id_number, id_document_url, dietary_restrictions, current_state, access_code
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7
            ) RETURNING guest_id, current_state, access_code;
        `;
        const regValues = [guestId, eventId, idNumber, idDocumentUrl, dietaryRestrictions, 1, accessCode];

        const result = await db.query(insertRegQuery, regValues);
        const newRegistration = result.rows[0];

        logger.stateChange(newRegistration.guest_id, 0, newRegistration.current_state);
        logger.info(context, `Successfully registered guest: ${newRegistration.guest_id} for event ID: ${eventId}`);

        // ARCHITECT NOTE: Fire-and-forget email delivery. 
        // We now successfully pass the eventName down to the email service.
        emailService.sendAccessCode(email, fullName, accessCode, eventName)
            .then(() => {
                logger.info(context, `Background email delivery successful for: ${email}`);
            })
            .catch((emailError) => {
                logger.error(context, `Failure Point E4-B: Background Email Delivery Failed to ${email}.`, emailError);
            });

        res.status(201).json({
            success: true,
            message: 'Guest successfully registered.',
            guestId: newRegistration.guest_id
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
        const event = await getEventBySlug(eventSlug, context);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
        
        const eventId = event.id;

        const page = Math.max(1, parseInt(req.query.page) || 1);
        let limit = parseInt(req.query.limit) || 10;
        
        if (limit > 100) limit = 100;
        if (limit < 1) limit = 10;

        const offset = (page - 1) * limit;

        let queryValues = [eventId];
        let countQueryValues = [eventId];
        let whereConditions = ['er.event_id = $1'];

        if (req.query.state !== undefined && req.query.state !== '') {
            const stateFilter = parseInt(req.query.state);
            const validStates = [0, 1, 2, -1];
            
            if (!validStates.includes(stateFilter)) {
                logger.warn(context, `Failure Point K: Invalid state filter: ${stateFilter}`);
                return res.status(400).json({ success: false, message: 'Invalid state filter.' });
            }
            
            whereConditions.push(`er.current_state = $${queryValues.length + 1}`);
            queryValues.push(stateFilter);
            countQueryValues.push(stateFilter);
        }

        const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

        queryValues.push(limit);
        const limitParamIndex = queryValues.length;
        
        queryValues.push(offset);
        const offsetParamIndex = queryValues.length;

        const fetchQuery = `
            SELECT g.id, g.full_name, g.email, er.current_state, er.registered_at as created_at 
            FROM guests g
            JOIN event_registrations er ON g.id = er.guest_id
            ${whereClause}
            ORDER BY er.registered_at DESC 
            LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex};
        `;
        
        const countQuery = `
            SELECT COUNT(*) 
            FROM guests g
            JOIN event_registrations er ON g.id = er.guest_id
            ${whereClause};
        `;

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
        const event = await getEventBySlug(eventSlug, context);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
        
        const eventId = event.id;

        const { newState, errorLog } = req.body;
        if (![0, 1, 2, -1].includes(newState)) {
            return res.status(400).json({ success: false, message: 'Invalid state value.' });
        }

        const checkQuery = `SELECT current_state FROM event_registrations WHERE guest_id = $1 AND event_id = $2;`;
        const checkResult = await db.query(checkQuery, [guestId, eventId]);

        if (checkResult.rowCount === 0) {
            logger.warn(context, `Failure Point E5: IDOR Attempt or missing ticket. Guest: ${guestId}, Event: ${eventId}`);
            return res.status(404).json({ success: false, message: 'Guest is not registered for this event.' });
        }

        const currentState = checkResult.rows[0].current_state;
        
        const updateQuery = `
            UPDATE event_registrations 
            SET current_state = $1, error_log = $2
            WHERE guest_id = $3 AND event_id = $4
            RETURNING guest_id as id, current_state;
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
        const event = await getEventBySlug(eventSlug, context);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
        
        const eventId = event.id;

        const { email, accessCode } = req.body;
        if (!email || !accessCode) {
            return res.status(400).json({ success: false, message: 'Email and access code are required.' });
        }

        const query = `
            SELECT g.id, g.full_name, er.current_state, er.id_document_url, er.access_code, g.phone, er.dietary_restrictions 
            FROM guests g
            JOIN event_registrations er ON g.id = er.guest_id
            WHERE g.email = $1 AND er.event_id = $2;
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
        const event = await getEventBySlug(eventSlug, context);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
        
        const eventId = event.id;

        const query = `SELECT current_state FROM event_registrations WHERE guest_id = $1 AND event_id = $2;`;
        const result = await db.query(query, [guestId, eventId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Guest ticket not found.' });
        }

        res.status(200).json({ success: true, currentState: result.rows[0].current_state });

    } catch (error) {
        logger.error(context, `Failure Point FF: CRITICAL FAILURE during status sync.`, error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const getGuestById = async (req, res) => {
    const context = 'GuestController - getGuestById';
    const guestId = req.params.id;
    const eventSlug = req.params.eventSlug;

    logger.info(context, `Fetching extended details for guest ID: ${guestId}`);

    try {
        const event = await getEventBySlug(eventSlug, context);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
        
        const eventId = event.id;

        const query = `
            SELECT g.id, g.full_name, g.email, g.phone, er.id_number, er.id_document_url, er.dietary_restrictions, er.current_state, er.registered_at as created_at 
            FROM guests g
            JOIN event_registrations er ON g.id = er.guest_id
            WHERE g.id = $1 AND er.event_id = $2;
        `;
        const result = await db.query(query, [guestId, eventId]);

        if (result.rowCount === 0) {
            logger.warn(context, `Failure Point G8: Guest ticket not found for ID: ${guestId}`);
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

// ARCHITECT NOTE: Recovery Mechanism to resend access codes without re-registering
const resendAccessCode = async (req, res) => {
    const context = 'GuestController - ResendCode';
    const eventSlug = req.params.eventSlug;
    const { email } = req.body;

    logger.info(context, `Received resend access code request for ${email} at event: ${eventSlug}`);

    try {
        const event = await getEventBySlug(eventSlug, context);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

        if (!email) {
            logger.warn(context, 'Failure Point R2: Missing email in resend request.');
            return res.status(400).json({ success: false, message: 'Email is required.' });
        }

        // We use a JOIN to ensure the global guest is actually registered for this specific event
        const query = `
            SELECT g.full_name, er.access_code 
            FROM guests g
            JOIN event_registrations er ON g.id = er.guest_id
            WHERE g.email = $1 AND er.event_id = $2;
        `;
        const result = await db.query(query, [email, event.id]);

        if (result.rowCount === 0) {
            logger.warn(context, `Failure Point R3: Resend failed. No ticket found for ${email} at ${eventSlug}`);
            return res.status(404).json({ success: false, message: 'No registration found for this email.' });
        }

        // Safely map the database snake_case to our backend camelCase
        const { full_name: fullName, access_code: accessCode } = result.rows[0];

        // ARCHITECT NOTE: Fire-and-forget email retry using the patched email service
        emailService.sendAccessCode(email, fullName, accessCode, event.name)
            .then(() => {
                logger.info(context, `Background email delivery successful for resend to: ${email}`);
            })
            .catch((emailError) => {
                logger.error(context, `Failure Point R4-B: Background Email Resend Failed to ${email}.`, emailError);
            });

        // Immediately unblock the UI
        res.status(200).json({ success: true, message: 'Access code resent successfully.' });

    } catch (error) {
        logger.error(context, 'Failure Point R5: CRITICAL FAILURE during resend access code.', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};


module.exports = {
    getGlobalGuests,
    registerGuest,
    getAllGuests,
    updateGuestState,
    guestLogin,
    getGuestStatus,
    getGuestById,
    resendAccessCode
};