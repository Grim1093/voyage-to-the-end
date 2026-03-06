const db = require('../config/db');
const logger = require('../utils/logger');

// --- READ PIPELINES ---

const getPublicEvents = async (req, res) => {
    const context = 'EventController - getPublicEvents';
    logger.info(context, 'Fetching all public, active events for Global Hub.');

    try {
        const query = `
            SELECT e.slug, e.name as title, e.start_date, e.end_date, e.description as desc, e.location, 
                   e.custom_domain, e.theme_config,
                   COALESCE(
                       (SELECT json_agg(ei.image_url ORDER BY ei.display_order) 
                        FROM event_images ei WHERE ei.event_id = e.id), '[]'::json
                   ) as images
            FROM events e
            WHERE e.is_public = TRUE 
            AND (e.end_date IS NULL OR e.end_date > CURRENT_TIMESTAMP)
            ORDER BY e.created_at DESC;
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

const getAllAdminEvents = async (req, res) => {
    const context = 'EventController - getAllAdminEvents';
    logger.info(context, 'Admin fetching ALL tenants for Master Control Plane.');

    try {
        const query = `
            SELECT e.id, e.slug, e.name as title, e.start_date, e.end_date, e.description as desc, e.location, e.is_public,
                   e.custom_domain, e.theme_config,
                   (e.end_date IS NOT NULL AND e.end_date < CURRENT_TIMESTAMP) as is_expired,
                   COALESCE(
                       (SELECT json_agg(ei.image_url ORDER BY ei.display_order) 
                        FROM event_images ei WHERE ei.event_id = e.id), '[]'::json
                   ) as images
            FROM events e
            ORDER BY e.created_at DESC;
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
            SELECT e.id, e.slug, e.name as title, e.start_date, e.end_date, e.description as desc, e.location, e.is_public,
                   e.custom_domain, e.theme_config,
                   (e.end_date IS NOT NULL AND e.end_date < CURRENT_TIMESTAMP) as is_expired,
                   COALESCE(
                       (SELECT json_agg(ei.image_url ORDER BY ei.display_order) 
                        FROM event_images ei WHERE ei.event_id = e.id), '[]'::json
                   ) as images
            FROM events e
            WHERE e.slug = $1;
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

// [Architecture] NEW: Edge Proxy Domain Resolution Endpoint
const getEventByDomain = async (req, res) => {
    const context = 'EventController - getEventByDomain';
    const { hostname } = req.params;
    logger.info(context, `Step 1: Edge Proxy requesting domain resolution for: ${hostname}`);

    try {
        // [Architecture] We use the binary tree index created in Phase 2 for ultra-fast B-Tree traversal.
        const query = `
            SELECT slug, theme_config 
            FROM events 
            WHERE custom_domain = $1 
            AND (end_date IS NULL OR end_date > CURRENT_TIMESTAMP);
        `;
        const result = await db.query(query, [hostname]);

        if (result.rowCount === 0) {
            logger.warn(context, `Failure Point EV-Domain: Domain [${hostname}] is not mapped to any active MSaaS Node.`);
            return res.status(404).json({ success: false, message: 'Domain unallocated or event expired.' });
        }

        logger.info(context, `Step 2: Domain [${hostname}] securely resolved to Node [${result.rows[0].slug}]. Transmitting payload to Edge Proxy...`);

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        logger.error(context, `Failure Point EV-Domain-Crit: CRITICAL FAILURE resolving domain ${hostname}.`, error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

// --- WRITE PIPELINES ---

const createEvent = async (req, res) => {
    const context = 'EventController - createEvent';
    logger.info(context, 'Step 1: Admin attempting to deploy a new tenant.');

    try {
        const { name, slug, description, startDate, endDate, location, isPublic, images, customDomain, themeConfig } = req.body;

        if (!name || !slug) {
            return res.status(400).json({ success: false, message: 'Event Name and Slug are required.' });
        }

        const safeCustomDomain = customDomain && customDomain.trim() !== '' ? customDomain.trim() : null;
        const safeThemeConfig = themeConfig || {};

        logger.info(context, 'Step 2: Scanning ledger for Name, Slug, or Domain collisions...');
        const checkQuery = `
            SELECT slug, name, custom_domain 
            FROM events 
            WHERE slug = $1 OR name ILIKE $2 OR (custom_domain = $3 AND custom_domain IS NOT NULL);
        `;
        const checkResult = await db.query(checkQuery, [slug, name, safeCustomDomain]);

        if (checkResult.rowCount > 0) {
            const collision = checkResult.rows[0];
            if (collision.slug === slug) {
                logger.warn(context, 'Failure Point EV-Deploy: Slug collision detected.');
                return res.status(409).json({ success: false, message: 'An event with this URL slug already exists.' });
            }
            if (collision.name.toLowerCase() === name.toLowerCase()) {
                logger.warn(context, 'Failure Point EV-Deploy: Name collision detected.');
                return res.status(409).json({ success: false, message: 'An event with this exact Name already exists.' });
            }
            if (collision.custom_domain === safeCustomDomain) {
                logger.warn(context, 'Failure Point EV-Deploy: Custom Domain collision detected.');
                return res.status(409).json({ success: false, message: 'This Custom Domain is already mapped to another event.' });
            }
        }

        logger.info(context, 'Step 3: Collision check passed. Inserting into database with MSaaS Edge configs...');
        const insertQuery = `
            INSERT INTO events (name, slug, description, start_date, end_date, location, is_public, custom_domain, theme_config)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, name, slug, custom_domain, is_public;
        `;
        
        const publicFlag = isPublic !== undefined ? isPublic : true;
        const safeStartDate = startDate ? startDate : null;
        const safeEndDate = endDate ? endDate : null;

        const values = [name, slug, description, safeStartDate, safeEndDate, location, publicFlag, safeCustomDomain, safeThemeConfig];
        const result = await db.query(insertQuery, values);
        const newEvent = result.rows[0];

        if (images && Array.isArray(images) && images.length > 0) {
            logger.info(context, `Step 3.5: Provisioning ${images.length} images for tenant...`);
            const insertPromises = images.map((url, idx) => {
                return db.query(
                    `INSERT INTO event_images (event_id, image_url, display_order) VALUES ($1, $2, $3)`,
                    [newEvent.id, url, idx]
                );
            });
            await Promise.all(insertPromises);
            newEvent.images = images;
        } else {
            newEvent.images = [];
        }

        logger.info(context, `Step 4: Successfully deployed new tenant: ${newEvent.slug}`);

        res.status(201).json({
            success: true,
            message: 'Event successfully created.',
            data: newEvent
        });

    } catch (error) {
        logger.error(context, 'Failure Point EV6: CRITICAL FAILURE deploying tenant.', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const updateEvent = async (req, res) => {
    const context = 'EventController - updateEvent';
    const currentSlug = req.params.eventSlug;
    logger.info(context, `Step 1: Admin attempting to update tenant: ${currentSlug}`);

    try {
        const { name, slug, description, startDate, endDate, location, isPublic, images, customDomain, themeConfig } = req.body;

        if (!name || !slug) {
            return res.status(400).json({ success: false, message: 'Event Name and Slug are required.' });
        }

        logger.info(context, 'Step 2: Verifying target tenant exists...');
        const checkExistQuery = `SELECT id FROM events WHERE slug = $1;`;
        const existResult = await db.query(checkExistQuery, [currentSlug]);

        if (existResult.rowCount === 0) {
            logger.warn(context, `Failure Point EV-Update: Target tenant not found: ${currentSlug}`);
            return res.status(404).json({ success: false, message: 'Event not found.' });
        }

        const eventId = existResult.rows[0].id;
        const safeCustomDomain = customDomain && customDomain.trim() !== '' ? customDomain.trim() : null;
        const safeThemeConfig = themeConfig || {};

        logger.info(context, 'Step 3: Scanning ledger for collision with other nodes...');
        const checkCollisionQuery = `
            SELECT slug, name, custom_domain 
            FROM events 
            WHERE (slug = $1 OR name ILIKE $2 OR (custom_domain = $3 AND custom_domain IS NOT NULL)) 
            AND id != $4;
        `;
        const collisionResult = await db.query(checkCollisionQuery, [slug, name, safeCustomDomain, eventId]);
        
        if (collisionResult.rowCount > 0) {
            const collision = collisionResult.rows[0];
            if (collision.slug === slug) {
                logger.warn(context, 'Failure Point EV-Update: Slug collision detected with another node.');
                return res.status(409).json({ success: false, message: 'The requested URL slug is already in use by another event.' });
            }
            if (collision.name.toLowerCase() === name.toLowerCase()) {
                logger.warn(context, 'Failure Point EV-Update: Name collision detected with another node.');
                return res.status(409).json({ success: false, message: 'The requested Event Name is already in use by another event.' });
            }
            if (collision.custom_domain === safeCustomDomain) {
                logger.warn(context, 'Failure Point EV-Update: Custom Domain collision detected with another node.');
                return res.status(409).json({ success: false, message: 'This Custom Domain is already mapped to another event.' });
            }
        }

        logger.info(context, 'Step 4: Collision check passed. Committing MSaaS updates...');
        const updateQuery = `
            UPDATE events 
            SET name = $1, slug = $2, description = $3, start_date = $4, end_date = $5, location = $6, is_public = $7, custom_domain = $8, theme_config = $9
            WHERE id = $10
            RETURNING id, name, slug, custom_domain, is_public;
        `;
        
        const publicFlag = isPublic !== undefined ? isPublic : true;
        const safeStartDate = startDate ? startDate : null;
        const safeEndDate = endDate ? endDate : null;

        const values = [name, slug, description, safeStartDate, safeEndDate, location, publicFlag, safeCustomDomain, safeThemeConfig, eventId];

        const result = await db.query(updateQuery, values);
        const updatedEvent = result.rows[0];

        if (images && Array.isArray(images)) {
            logger.info(context, `Step 4.5: Synchronizing image node architecture...`);
            await db.query(`DELETE FROM event_images WHERE event_id = $1`, [eventId]);
            
            if (images.length > 0) {
                const insertPromises = images.map((url, idx) => {
                    return db.query(
                        `INSERT INTO event_images (event_id, image_url, display_order) VALUES ($1, $2, $3)`,
                        [eventId, url, idx]
                    );
                });
                await Promise.all(insertPromises);
            }
            updatedEvent.images = images;
        }

        logger.info(context, `Step 5: Successfully updated tenant: ${updatedEvent.slug}`);

        res.status(200).json({
            success: true,
            message: 'Event successfully updated.',
            data: updatedEvent
        });

    } catch (error) {
        logger.error(context, `Failure Point EV10: CRITICAL FAILURE updating tenant ${currentSlug}.`, error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const deleteEvent = async (req, res) => {
    const context = 'EventController - deleteEvent';
    const { eventSlug } = req.params;
    logger.info(context, `Step 1: Admin initiated purge protocol for tenant: ${eventSlug}`);

    try {
        const deleteQuery = `DELETE FROM events WHERE slug = $1 RETURNING id, name;`;
        const result = await db.query(deleteQuery, [eventSlug]);

        if (result.rowCount === 0) {
            logger.warn(context, `Failure Point EV12: Cannot delete, event not found: ${eventSlug}`);
            return res.status(404).json({ success: false, message: 'Event not found.' });
        }

        logger.info(context, `Step 2: Tenant ${result.rows[0].name} and all cascading data successfully obliterated.`);
        res.status(200).json({ 
            success: true, 
            message: 'Tenant environment has been securely purged.' 
        });

    } catch (error) {
        logger.error(context, `Failure Point EV13: CRITICAL FAILURE during deletion of ${eventSlug}.`, error);
        res.status(500).json({ success: false, message: 'Internal server error during deletion cascade.' });
    }
};

module.exports = {
    getPublicEvents,
    getAllAdminEvents,
    getEventBySlug,
    getEventByDomain,
    createEvent,
    updateEvent,
    deleteEvent
};