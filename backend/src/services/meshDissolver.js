const cron = require('node-cron');
const { pool } = require('../config/db');
const { redisClient } = require('../config/cache');
const { sendMeshExport } = require('./emailService'); // [Architecture] Import the HTTP Transporter

console.log('[Mesh Dissolver] System initialized: Ephemeral CRON Worker ready for deployment.');

const processDissolveEvent = async () => {
    const context = '[Mesh Dissolver]';
    console.log(`${context} Step 1: Waking up. Querying Global Ledger for expired Nodes...`);

    const pgClient = await pool.connect();

    try {
        const { rows: expiredEvents } = await pgClient.query(`
            SELECT id, name, end_date 
            FROM events 
            WHERE end_date <= NOW() AND mesh_dissolved = FALSE;
        `);

        if (expiredEvents.length === 0) {
            console.log(`${context} Step 2: No expired Nodes detected. Returning to sleep state.`);
            return;
        }

        console.log(`${context} Step 2: Detected ${expiredEvents.length} expired Node(s). Initiating state transfer...`);

        for (const event of expiredEvents) {
            const eventId = event.id;
            console.log(`${context} Step 3: Initiating dissolve protocol for Node [${eventId} - ${event.name}]...`);

            await pgClient.query('BEGIN'); 

            // --- A. EXTRACTION ---
            let acceptedEchos = [];
            if (redisClient) {
                const acceptedKey = `abyss:node:${eventId}:echos_accepted`;
                const rawEchos = await redisClient.smembers(acceptedKey);
                acceptedEchos = rawEchos.map(echo => JSON.parse(echo));
                console.log(`${context} Step 4: Extracted ${acceptedEchos.length} finalized echos from Valkey for Node [${eventId}].`);
            }

            // --- B. LEDGER MUTATION ---
            if (acceptedEchos.length > 0) {
                console.log(`${context} Step 5: Writing ephemeral graph to PostgreSQL permanent storage...`);
                
                const insertQuery = `
                    INSERT INTO finalized_echos (event_id, initiator_id, receiver_id)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (event_id, initiator_id, receiver_id) DO NOTHING;
                `;

                for (const [initiator_id, receiver_id] of acceptedEchos) {
                    await pgClient.query(insertQuery, [eventId, initiator_id, receiver_id]);
                }
            } else {
                console.log(`${context} Step 5: No echos formed in this Abyss. Bypassing ledger insertion.`);
            }

            // --- C. STATE LOCK ---
            console.log(`${context} Step 6: Locking Node state. Marking mesh as dissolved...`);
            await pgClient.query(`
                UPDATE events 
                SET mesh_dissolved = TRUE 
                WHERE id = $1;
            `, [eventId]);

            // --- D. CACHE WIPE ---
            if (redisClient) {
                console.log(`${context} Step 7: Wiping ephemeral footprint from Valkey...`);
                await redisClient.del(`abyss:node:${eventId}:online`);
                await redisClient.del(`abyss:node:${eventId}:echos_pending`);
                await redisClient.del(`abyss:node:${eventId}:echos_accepted`);
            }

            // [Architecture] Commit state BEFORE sending emails to prevent Resend timeouts from rolling back our DB
            await pgClient.query('COMMIT'); 
            console.log(`${context} Step 8: SUCCESS. Node [${eventId}] Abyss successfully dissolved in Global Ledger.`);
            
            // --- E. EMAIL EXPORT PIPELINE ---
            if (acceptedEchos.length > 0) {
                console.log(`${context} Step 9: Initiating Email Extraction Pipeline...`);
                
                // CTE (Common Table Expression) to bidirectionally map connections and aggregate into JSON
                const emailExtractionQuery = `
                    WITH user_connections AS (
                        SELECT initiator_id AS user_id, receiver_id AS connection_id FROM finalized_echos WHERE event_id = $1
                        UNION
                        SELECT receiver_id AS user_id, initiator_id AS connection_id FROM finalized_echos WHERE event_id = $1
                    )
                    SELECT
                        uc.user_id,
                        u.full_name AS user_name,
                        u.email AS user_email,
                        json_agg(
                            json_build_object(
                                'full_name', c.full_name,
                                'email', c.email,
                                'phone', c.phone
                            )
                        ) AS connections
                    FROM user_connections uc
                    JOIN guests u ON uc.user_id = u.id
                    JOIN guests c ON uc.connection_id = c.id
                    GROUP BY uc.user_id, u.full_name, u.email;
                `;

                const { rows: emailPayloads } = await pgClient.query(emailExtractionQuery, [eventId]);
                console.log(`${context} Step 10: Extracted ${emailPayloads.length} unique guest portfolios. Dispatching via Resend...`);

                // Map payloads to concurrent promises
                const emailPromises = emailPayloads.map(payload => 
                    sendMeshExport(payload.user_email, payload.user_name, event.name, payload.connections)
                );

                // Execute concurrently. Promise.allSettled ensures one failed email doesn't crash the loop.
                const results = await Promise.allSettled(emailPromises);
                
                const failed = results.filter(r => r.status === 'rejected').length;
                console.log(`${context} Step 11: Email pipeline resolved. Success: ${results.length - failed}, Failed: ${failed}.`);
            }
        }

    } catch (error) {
        // Only rollback if we haven't already committed
        await pgClient.query('ROLLBACK');
        console.error(`${context} CRITICAL Failure Point A: Ledger mutation failed during dissolve sequence. Transaction rolled back.`, error.message);
    } finally {
        pgClient.release();
        console.log(`${context} Step 12: Database uplink released. Worker sequence complete.`);
    }
};

const startMeshDissolver = () => {
    cron.schedule('*/5 * * * *', () => {
        processDissolveEvent();
    });
    console.log('[Mesh Dissolver] Step 0: CRON scheduler activated. Monitoring timeline strictly every 5 minutes.');
};

module.exports = { startMeshDissolver };