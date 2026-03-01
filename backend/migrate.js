require('dotenv').config();
const { Pool } = require('pg');

// Initialize a temporary connection to your Aiven database
// We pull the credentials directly from your secure .env file
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Ensure this matches your .env variable name
    ssl: { rejectUnauthorized: false } // Required for secure cloud databases like Aiven
});

const runMigration = async () => {
    const context = '[Database Migration]';
    console.log(`${context} Step 1: Initializing connection to Aiven PostgreSQL ledger...`);

    try {
        // The SQL command to upgrade our schema
        const query = `ALTER TABLE guests ADD COLUMN access_code VARCHAR(10);`;
        
        console.log(`${context} Step 2: Executing schema upgrade...`);
        await pool.query(query);
        
        console.log(`${context} Step 3: SUCCESS. The 'access_code' column has been securely added to the guests table.`);
    } catch (error) {
        // Failure Point Z: Catching any SQL syntax errors or connection drops
        console.error(`${context} CRITICAL FAILURE (Failure Point Z): Schema migration failed.`, error.message);
        
        if (error.code === '42701') {
            console.warn(`${context} Note: Column 'access_code' already exists. No harm done!`);
        }
    } finally {
        // Always close the connection so the script doesn't hang forever
        await pool.end();
        console.log(`${context} Step 4: Database connection securely closed.`);
    }
};

// Execute the function
runMigration();