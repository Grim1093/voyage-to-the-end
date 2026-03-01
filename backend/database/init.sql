-- Enable the UUID extension in PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the guests table with strict constraints
CREATE TABLE IF NOT EXISTS guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    
    -- Logistics & Verification
    id_number VARCHAR(100) NOT NULL,
    id_document_url TEXT NOT NULL,
    dietary_restrictions TEXT,
    
    -- State Machine & Logging (Crucial for our architecture)
    current_state INTEGER DEFAULT 0, -- 0: Invited, 1: Submitted, 2: Verified, -1: Error
    error_log TEXT,                  -- Will hold specific failure reasons if state drops to -1
    
    -- Audit Trails
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Note: To run this, you will execute this file against your Aiven PostgreSQL URL.