const db = require('../config/db');
const logger = require('../utils/logger');

const getPublicEvents = async (req, res) => {
    const context = 'EventController - getPublicEvents';
    logger.info(context, 'Fetching all public events for Global Hub.');

    try {
        const query = `
            SELECT slug, name as title, event_date as date, description as desc, location 
            FROM events 
            WHERE is_public = TRUE 
            ORDER BY created_at DESC;
        `;
        const result = await db.query(query);

        res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        logger.error(context, 'Failure Point EV1: CRITICAL FAILURE fetching public events.', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

// ARCHITECT NOTE: The New Master Control Plane Fetcher
const getAllAdminEvents = async (req, res) => {
    const context = 'EventController - getAllAdminEvents';
    logger.info(context, 'Admin fetching ALL tenants (public and private) for Master Control Plane.');

    try {
        // Notice there is no 'WHERE is_public = TRUE' filter here!
        const query = `
            SELECT id, slug, name as title, event_date as date, description as desc, location, is_public 
            FROM events 
            ORDER BY created_at DESC;
        `;
        const result = await db.query(query);

        res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        logger.error(context, 'Failure Point EV11: CRITICAL FAILURE fetching all admin events.', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const getEventBySlug = async (req, res) => {
    const context = 'EventController - getEventBySlug';
    const { eventSlug } = req.params;
    logger.info(context, `Fetching details for event: ${eventSlug}`);

    try {
        const query = `
            SELECT slug, name as title, event_date as date, description as desc, location, is_public 
            FROM events 
            WHERE slug = $1;
        `;
        const result = await db.query(query, [eventSlug]);

        if (result.rowCount === 0) {
            logger.warn(context, `Failure Point EV2: Event not found for slug: ${eventSlug}`);
            return res.status(404).json({ success: false, message: 'Event not found.' });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        logger.error(context, `Failure Point EV3: CRITICAL FAILURE fetching event ${eventSlug}.`, error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const createEvent = async (req, res) => {
    const context = 'EventController - createEvent';
    logger.info(context, 'Admin attempting to create a new event.');

    try {
        const { name, slug, description, eventDate, location, isPublic } = req.body;

        if (!name || !slug) {
            logger.warn(context, 'Failure Point EV4: Missing required fields (name or slug).');
            return res.status(400).json({ success: false, message: 'Event Name and Slug are required.' });
        }

        const checkQuery = `SELECT id FROM events WHERE slug = $1;`;
        const checkResult = await db.query(checkQuery, [slug]);

        if (checkResult.rowCount > 0) {
            logger.warn(context, `Failure Point EV5: Slug already exists: ${slug}`);
            return res.status(409).json({ success: false, message: 'An event with this URL slug already exists.' });
        }

        const insertQuery = `
            INSERT INTO events (name, slug, description, event_date, location, is_public)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, name, slug, is_public;
        `;
        const publicFlag = isPublic !== undefined ? isPublic : true;
        const values = [name, slug, description, eventDate, location, publicFlag];

        const result = await db.query(insertQuery, values);
        const newEvent = result.rows[0];

        logger.info(context, `Successfully created new event: ${newEvent.slug} (ID: ${newEvent.id})`);

        res.status(201).json({
            success: true,
            message: 'Event successfully created.',
            data: newEvent
        });

    } catch (error) {
        logger.error(context, 'Failure Point EV6: CRITICAL FAILURE creating event.', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const updateEvent = async (req, res) => {
    const context = 'EventController - updateEvent';
    const currentSlug = req.params.eventSlug;
    logger.info(context, `Admin attempting to update event: ${currentSlug}`);

    try {
        const { name, slug, description, eventDate, location, isPublic } = req.body;

        if (!name || !slug) {
            logger.warn(context, 'Failure Point EV7: Missing required fields for update.');
            return res.status(400).json({ success: false, message: 'Event Name and Slug are required.' });
        }

        const checkExistQuery = `SELECT id FROM events WHERE slug = $1;`;
        const existResult = await db.query(checkExistQuery, [currentSlug]);

        if (existResult.rowCount === 0) {
            logger.warn(context, `Failure Point EV8: Target event not found: ${currentSlug}`);
            return res.status(404).json({ success: false, message: 'Event not found.' });
        }

        const eventId = existResult.rows[0].id;

        if (currentSlug !== slug) {
            const checkSlugQuery = `SELECT id FROM events WHERE slug = $1 AND id != $2;`;
            const slugResult = await db.query(checkSlugQuery, [slug, eventId]);
            
            if (slugResult.rowCount > 0) {
                logger.warn(context, `Failure Point EV9: Target slug already in use: ${slug}`);
                return res.status(409).json({ success: false, message: 'The requested URL slug is already in use by another event.' });
            }
        }

        const updateQuery = `
            UPDATE events 
            SET name = $1, slug = $2, description = $3, event_date = $4, location = $5, is_public = $6
            WHERE id = $7
            RETURNING id, name, slug, is_public;
        `;
        
        const publicFlag = isPublic !== undefined ? isPublic : true;
        const values = [name, slug, description, eventDate, location, publicFlag, eventId];

        const result = await db.query(updateQuery, values);
        const updatedEvent = result.rows[0];

        logger.info(context, `Successfully updated event: ${updatedEvent.slug} (ID: ${updatedEvent.id})`);

        res.status(200).json({
            success: true,
            message: 'Event successfully updated.',
            data: updatedEvent
        });

    } catch (error) {
        logger.error(context, `Failure Point EV10: CRITICAL FAILURE updating event ${currentSlug}.`, error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

module.exports = {
    getPublicEvents,
    getAllAdminEvents,
    getEventBySlug,
    createEvent,
    updateEvent
};