const db = require('../config/db');
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

        // Step 3: Parameterized SQL Query 
        const insertQuery = `
            INSERT INTO guests (
                full_name, email, phone, id_number, id_document_url, dietary_restrictions, current_state
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7
            ) RETURNING id, current_state;
        `;
        const values = [fullName, email, phone, idNumber, idDocumentUrl, dietaryRestrictions, 1];

        const result = await db.query(insertQuery, values);
        const newGuest = result.rows[0];

        // Step 4: State Change Logging
        logger.stateChange(newGuest.id, 0, newGuest.current_state);
        logger.info(context, `Successfully registered guest: ${newGuest.id}`);

        res.status(201).json({
            success: true,
            message: 'Guest successfully registered.',
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

// --- NEW PAGINATED READ PIPELINE ---
const getAllGuests = async (req, res) => {
    const context = 'GuestController';
    logger.info(context, 'Received request to fetch guest ledger (paginated).');

    try {
        // Step 1: Pagination Math (Failure Point C - Invalid input handling)
        // Default to page 1 if no query param is provided, ensure it's a number.
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        
        logger.info(context, `Pagination calculated: Page ${page}, Limit ${limit}, Offset ${offset}.`);

        // Step 2: Fetching the Data (Failure Point D - Database Read Error)
        logger.info(context, 'Executing database query to fetch guests...');
        
        // We exclude sensitive data like id_document_url for basic list views
        const fetchQuery = `
            SELECT id, full_name, email, current_state, created_at 
            FROM guests 
            ORDER BY created_at DESC 
            LIMIT $1 OFFSET $2;
        `;
        const result = await db.query(fetchQuery, [limit, offset]);
        logger.info(context, `Successfully retrieved ${result.rowCount} guests from the database.`);

        // Step 3: Fetching Metadata for the Frontend 
        logger.info(context, 'Fetching total guest count for pagination metadata...');
        const countQuery = `SELECT COUNT(*) FROM guests;`;
        const countResult = await db.query(countQuery);
        
        const totalGuests = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalGuests / limit);
        logger.info(context, `Total guests in ledger: ${totalGuests}. Total pages available: ${totalPages}.`);

        // Step 4: Return payload
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
        // Catch any database connection drops or query syntax issues
        logger.error(context, 'CRITICAL FAILURE during guest retrieval.', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during data retrieval.'
        });
    }
};

module.exports = {
    registerGuest,
    getAllGuests // Exported the new function
};