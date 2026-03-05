# Backend: API, Data Layer, and Telemetry

## Setup & Start Instructions
Follow these steps to initialize the backend environment and start the development server.

1. **Install Dependencies:**
   Navigate to the `/backend` directory and install the necessary npm packages:
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env` file in the root of the `backend/` directory. You will need to provide the following configuration values, particularly the connection string for the Aiven-hosted PostgreSQL database:
   ```env
   PORT=3000
   DATABASE_URL=postgres://<username>:<password>@<host>:<port>/<database>?sslmode=require
   ```
   *Note: Ensure `sslmode=require` is appended to the `DATABASE_URL` for secure connections to Aiven.*

3. **Start the Development Server:**
   Run the development script to start the server:
   ```bash
   npm run dev
   ```

## Folder Structure
The backend is organized to cleanly separate configuration, utilities, and application logic.

- `config/db.js`: Contains the PostgreSQL connection pool setup using the `pg` library.
- `utils/logger.js`: Houses the custom logging utility utilized extensively across the application to enforce the Telemetry Rule.
- `controllers/eventController.js`: Manages the business logic for all event-related API endpoints.

## The "Telemetry Rule"
In our backend architecture, we enforce a strict **"Telemetry Rule"**:
**Rigorous console logging is mandatory at every step of the data pipeline.**

This rule ensures comprehensive error tracking, state validation, and facilitates rapid debugging. Every incoming request, database query execution, data transformation, and outgoing response must be logged using our standardized logger (`utils/logger.js`). This meticulous telemetry is critical for maintaining the high reliability expected of our MSaaS platform.

## Current Achievements
- **Advanced Querying:** Implemented `json_agg` subqueries to efficiently fetch arrays of images associated with events directly within the primary database queries.
- **Timezone Enforcement:** Successfully enforced strict UTC timezone locking across all database operations, ensuring global consistency in event scheduling and registration timestamps.
