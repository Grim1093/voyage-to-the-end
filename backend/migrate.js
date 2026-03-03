require('dotenv').config();
const { Pool } = require('pg');

// Initialize a temporary connection to your Aiven database
// We pull the credentials directly from your secure .env file
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Ensure this matches your .env variable name
    ssl: { rejectUnauthorized: false } // Required for secure cloud databases like Aiven
});

const runMigration = async () => {
    const context = '[Event Chronology Migration]';
    console.log(`${context} Step 1: Initializing connection to Aiven PostgreSQL ledger...`);

    try {
        // Phase 1: Purge the old string-based column
        const dropQuery = `ALTER TABLE events DROP COLUMN IF EXISTS event_date;`;
        
        // Phase 2: Inject the new structured timestamp columns
        const addQuery = `
            ALTER TABLE events 
            ADD COLUMN start_date TIMESTAMP WITH TIME ZONE,
            ADD COLUMN end_date TIMESTAMP WITH TIME ZONE;
        `;
        
        console.log(`${context} Step 2: Executing schema downgrade (Dropping legacy 'event_date' varchar)...`);
        await pool.query(dropQuery);
        
        console.log(`${context} Step 3: Executing schema upgrade (Injecting 'start_date' and 'end_date' timestamps)...`);
        await pool.query(addQuery);
        
        console.log(`${context} Step 4: SUCCESS. The events node has been securely upgraded to the new chronological architecture.`);
    } catch (error) {
        // Failure Point DB-Migrate: Catching any SQL syntax errors or connection drops
        console.error(`${context} CRITICAL FAILURE (Failure Point DB-Migrate): Schema migration failed.`, error.message);
    } finally {
        // Always close the connection so the script doesn't hang forever
        await pool.end();
        console.log(`${context} Step 5: Database connection securely closed.`);
    }
};

// Execute the function
runMigration();