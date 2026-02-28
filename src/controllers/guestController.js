const db = require('../config/db');
const logger = require('../utils/logger');

const registerGuest = async (req, res) => {
    const context = 'GuestController';
    logger.info(context, 'Received new guest registration request.');

    try {
        // Step 1: Extract data from the incoming request body
        const { fullName, email, phone, idNumber, idDocumentUrl, dietaryRestrictions } = req.body;

        // Step 2: Input Validation (Failure Point B)
        // If any of these critical fields are missing, we log it and reject the request immediately.
        if (!fullName || !email || !idNumber || !idDocumentUrl) {
            logger.warn(context, `Validation failed. Missing required fields for email: ${email || 'UNKNOWN'}`);
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: fullName, email, idNumber, and idDocumentUrl are mandatory.'
            });
        }

        logger.info(context, `Validation passed for ${email}. Attempting database insertion.`);

        // Step 3: Parameterized SQL Query (Security best practice)
        // We hardcode current_state to 1 because submitting this form means they move to State 1.
        const insertQuery = `
            INSERT INTO guests (
                full_name, email, phone, id_number, id_document_url, dietary_restrictions, current_state
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7
            ) RETURNING id, current_state;
        `;
        const values = [fullName, email, phone, idNumber, idDocumentUrl, dietaryRestrictions, 1];

        // Execute the query
        const result = await db.query(insertQuery, values);
        const newGuest = result.rows[0];

        // Step 4: State Change Logging
        // Conceptually, they move from State 0 (Invited) to State 1 (Submitted)
        logger.stateChange(newGuest.id, 0, newGuest.current_state);
        
        logger.info(context, `Successfully registered guest: ${newGuest.id}`);

        // Send a success response back to the guest's browser
        res.status(201).json({
            success: true,
            message: 'Guest successfully registered.',
            guestId: newGuest.id
        });

    } catch (error) {
        // Step 5: Catch Database Errors
        // Error code '23505' is PostgreSQL's specific code for a Unique Constraint Violation
        if (error.code === '23505') { 
            logger.warn(context, `Registration failed. Email already exists in ledger: ${req.body.email}`);
            return res.status(409).json({
                success: false,
                message: 'A guest with this email is already registered.'
            });
        }

        // Catch any other unexpected server or database crashes
        logger.error(context, 'CRITICAL FAILURE during guest registration.', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration.'
        });
    }
};

module.exports = {
    registerGuest
};