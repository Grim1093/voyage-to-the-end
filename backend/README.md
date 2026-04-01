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
   Create a `.env` file in the root of the `backend/` directory. You will need to provide the following configuration values, particularly the connection string for the Aiven-hosted PostgreSQL database and Valkey/Redis cache configuration:
   ```env
   PORT=3000
   DATABASE_URL=postgres://<username>:<password>@<host>:<port>/<database>?sslmode=require
   VALKEY_URL=redis://<username>:<password>@<host>:<port>
   JWT_SECRET=your_super_secret_jwt_key
   ```
   *Note: Ensure `sslmode=require` is appended to the `DATABASE_URL` for secure connections to Aiven.*

3. **Start the Development Server:**
   Run the development script to start the server:
   ```bash
   npm run dev
   ```

## Folder Structure
The backend is organized to cleanly separate configuration, utilities, and application logic.

- `config/`: System connection configurations (`db.js`, `cache.js`).
- `controllers/`: Express route handlers (`abyssController.js`, `authController.js`, `eventController.js`, `guestController.js`, `tenantController.js`).
- `middleware/`: Request interceptors (`authMiddleware.js`, `socketAuth.js`).
- `routes/`: Registers HTTP API paths (`authRoutes.js`, `eventRoutes.js`, `guestRoutes.js`, `tenantRoutes.js`).
- `services/`: External API integrations and background orchestration (`emailService.js`, `meshDissolver.js`, `vercelService.js`).
- `utils/`: Shared helper functions and admin scripts (`logger.js`, `createAdmin.js`, `migrateThemes.js`, `migrateAbyss.js`).

## Coding Conventions
- **Asynchronous I/O:** Favor asynchronous I/O operations (e.g., using `fs.promises.readFile`) over synchronous ones (e.g., `fs.readFileSync`) within async contexts to prevent blocking the Node.js event loop.
- **Controller Exports:** Service logic handlers are exported to enable unit testing.
- **Bulk Insertions:** Prefer bulk insertions for junction tables.

## Testing Context
- The backend directory currently uses the native Node.js test runner (`node --test`). Note that tests may need mocked `node_modules` and dependencies due to network restrictions. Tests should focus on controller/service logic.

## The "Telemetry Rule"
In our backend architecture, we enforce a strict **"Telemetry Rule"**:
**Rigorous console logging is mandatory at every step of the data pipeline.**

This rule ensures comprehensive error tracking, state validation, and facilitates rapid debugging. Every incoming request, database query execution, data transformation, and outgoing response must be logged using our standardized logger (`utils/logger.js`). Sensitive environment variables should NOT be logged.

## Current Achievements
- **Advanced Querying:** Implemented `json_agg` subqueries to efficiently fetch arrays of images associated with events directly within the primary database queries.
- **Timezone Enforcement:** Successfully enforced strict UTC timezone locking across all database operations, ensuring global consistency in event scheduling and registration timestamps.
- **WebSockets (The Abyss):** The real-time messaging subsystem utilizes `@socket.io/redis-adapter` and `ioredis` (Valkey Connection Protocol) for horizontal scaling. Supports direct messaging and presence.
- **`guestLogin` Upgrade Path:** An automatic upgrade path is in place for legacy plaintext access codes, converting them to bcrypt hashes using the `upgradeLegacyPassword` helper function during login.
- **Access Code Resend Cooldown:** Integrated logic into `emailService` and `guestController` to ensure access codes can be securely re-dispatched with a time-based cooldown.
