const { Pool } = require('pg');
const logger = require('../utils/logger');
require('dotenv').config(); // Load environment variables from our new .env file

// ARCHITECT NOTE: We are securely loading the string from the .env file.
const connectionString = process.env.DATABASE_URL;

// Initialize the Connection Pool using the official Aiven CA Certificate
const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: true, // Security is ON
        ca: `-----BEGIN CERTIFICATE-----
MIIEUDCCArigAwIBAgIUVa+Nhv5TGqyCrlQzyQxRMgKYCMUwDQYJKoZIhvcNAQEM
BQAwQDE+MDwGA1UEAww1ZWVhZjk4OWUtZWQ2OS00ZDMzLWJlZDUtZWQyZjZjZDQ5
NzQwIEdFTiAxIFByb2plY3QgQ0EwHhcNMjYwMTE3MTQ1ODM5WhcNMzYwMTE1MTQ1
ODM5WjBAMT4wPAYDVQQDDDVlZWFmOTg5ZS1lZDY5LTRkMzMtYmVkNS1lZDJmNmNk
NDk3NDAgR0VOIDEgUHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCC
AYoCggGBAKxZedecItfxfC44zSu5IExt/6KhFdZ5lcFE98ZOcQzshvNen6snO9HB
g8VLlpWrSN7WLXiWKt+35seGWfaBg0tP6Qu/Hsj5UxbbDvmLZncULDy97vF3GAEw
tlvCmueaKblnISbLD4wk/lm+AMvp+6Yi+VGHYVT0voQRF2HzBe4RLCGvt/qh0sG1
jSuHmkriKNL7Nnsd+dYcQi8RQMGV0F7ojqhIwyTmgJbzxZbR4Epb9wr2N85Ii2QF
1z5a1QQu7BsFb7WpK/KXGWVOb52WuULiJG0GaHFVmyR0PXQuEKg7gOZX0o9Z2r8P
6BNb75JsMCppy8LrTT0B0uB4rp5NAzYQga5rmB2TReNIYZzBujtrVw3U+WnC8D7K
ehumEcBaznCrpEtuNQ4xu/MHbjRC1Pw7A3k3dYAhgJituKPfuxvJdCp3LvSkJnCJ
aIgoRQwbohB+1km5zppN1waAg5Hi3BDLUl/bVN1P13oJyxXvJ3gF7L83p8vgCoZo
5zXZiSpj4QIDAQABo0IwQDAdBgNVHQ4EFgQUKNSyGQcmXIf+Avbreh0eBdSp50cw
EgYDVR0TAQH/BAgwBgEB/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQAD
ggGBAEXiC2lKfG9OrKHElJdlAy7a3bVfBLokx3e1vDqSllzZXdfiejC7ADe6jnXg
lyQDnsIBHUcdP86ZuEq9eW1MeCABQomfVZtfTTfRrZ1i4mnXdR/BartU3IMtvlXw
p08G0g6SlsMBCo4AfgxMzX+hQYAy+SNrU99kwwGZmlz8xlOYhQqeazAZRGwzLXus
cNwtMiNICQ8gKOZLSTn0FwCncCMP3BNUODEd/qo96Ych8Cs1cuWkzK04Jl7epvEO
3amu1lPGosGBRR3ovOeezUTrUM8Z0Wh9kzGE9f0vtH9CfK1IOcYKYTQDNjKEwbqh
WQTGpojk3aka3ZpLwgjsiraUKVvMeHg+TgW5pJegddaDNQcyLwcdK6RR/r9+kbpj
7VVTRoNbtTLdDfF8/tbW15sY23WTXaqClTeCxWQHe2sjidooNkqNTREYaXwbY1hG
V0xmb6NqoCzq+aJzKd/LzuujauqIhZretu+iUZEs2WiePGCocbXs1iF/f7H4LG5K
v2NVgg==
-----END CERTIFICATE-----
`
    }
});

/**
 * We immediately test the connection when the server starts.
 * This is "Failure Point 0" - if the database is down, we must know immediately.
 */
const connectDB = async () => {
    try {
        logger.info('Database', 'Attempting to securely connect to Aiven PostgreSQL...');
        const client = await pool.connect();
        
        // If we reach this line, the connection was successful
        logger.info('Database', 'Successfully connected to PostgreSQL with verified SSL!');
        
        // Release the client back to the pool so it can be used by other queries
        client.release(); 
    } catch (error) {
        // If the password is wrong, or the network drops, our custom logger catches it
        logger.error('Database', 'CRITICAL FAILURE: Could not connect to PostgreSQL.', error);
        
        // If the DB is down, there is no point in running the app. We kill the process.
        process.exit(1); 
    }
};

module.exports = {
    pool,
    connectDB,
    // We export this helper function so our controllers can easily run SQL queries
    query: (text, params) => pool.query(text, params),
};