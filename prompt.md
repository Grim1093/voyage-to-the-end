# Master Architecture & Project Overview

## Main Goal
The core goal of this repository is to provide a high-end, multi-tenant MICE (Meetings, Incentives, Conferences, and Exhibitions) platform. It operates as a Multi-Software as a Service (MSaaS) and is engineered to deliver unparalleled performance and visual fidelity for premium events.

## What is done & Capabilities
- **Multi-Tenant Architecture:** Capable of hosting isolated events (Tenants/Nodes) within a broader MSaaS ecosystem. Includes a comprehensive RBAC (Role-Based Access Control) system supporting Superadmins, Tenant Admins, and Event Staff with isolated Organization nodes.
- **Global Ledger:** Fully operational PostgreSQL database hosted on Aiven, enforcing strict UTC timezones for all timestamps.
- **Admin Control Plane:** Live management dashboard used for system-wide configuration, node deployment, event management, organization creation, and staff provisioning.
- **Advanced UI/UX Architecture:**
  - Ultra-premium, dark-mode, cinematic aesthetics.
  - Hardware Acceleration: Complex visual effects like moving CSS Gaussian blurs have been eliminated in favor of Framer Motion and GPU-accelerated concurrent z-index fading and ambient-aurora gradients.
  - Graceful UI Degradation across varying network and device capabilities.
  - Custom React Server Components and Next.js App Router for high-performance navigation and rendering.
- **Global Directory & Edge Routing:** Public-facing hub for discovering events, combined with Vercel Edge Middleware (`proxy.js`) for dynamic custom domain resolution directly mapped to specific event Nodes.
- **Telemetry Rule:** Comprehensive server-side logging at every step of the backend data pipeline.
- **The Abyss (Transport Layer):** WebSocket and Valkey (Redis) integration for real-time mesh connectivity. Supports ephemeral event meshes and direct messaging between guests with horizontal scaling capabilities. Includes background CRON jobs for node dissolution and email extraction pipelines.

## Complete Project Structure

```text
.
├── backend
│   ├── .gitignore
│   ├── README.md
│   ├── database
│   │   └── init.sql
│   ├── migrate.js
│   ├── package-lock.json
│   ├── package.json
│   ├── scripts
│   │   ├── printSchema.js
│   │   └── setupDb.js
│   └── src
│       ├── config
│       │   ├── cache.js
│       │   └── db.js
│       ├── controllers
│       │   ├── abyssController.js
│       │   ├── authController.js
│       │   ├── eventController.js
│       │   ├── guestController.js
│       │   └── tenantController.js
│       ├── middleware
│       │   ├── authMiddleware.js
│       │   └── socketAuth.js
│       ├── routes
│       │   ├── authRoutes.js
│       │   ├── eventRoutes.js
│       │   ├── guestRoutes.js
│       │   └── tenantRoutes.js
│       ├── server.js
│       ├── services
│       │   ├── emailService.js
│       │   ├── meshDissolver.js
│       │   └── vercelService.js
│       └── utils
│           ├── createAdmin.js
│           ├── logger.js
│           ├── migrateAbyss.js
│           └── migrateThemes.js
├── frontend
│   ├── .gitignore
│   ├── README.md
│   ├── components.json
│   ├── eslint.config.mjs
│   ├── jsconfig.json
│   ├── next.config.mjs
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── public
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   ├── next.svg
│   │   ├── vercel.svg
│   │   └── window.svg
│   └── src
│       ├── app
│       │   ├── [eventSlug]
│       │   │   ├── page.js
│       │   │   ├── portal
│       │   │   │   ├── dashboard
│       │   │   │   │   └── page.js
│       │   │   │   └── page.js
│       │   │   └── register
│       │   │       └── page.js
│       │   ├── admin
│       │   │   ├── [eventSlug]
│       │   │   │   └── page.js
│       │   │   ├── events
│       │   │   │   ├── [eventSlug]
│       │   │   │   │   └── edit
│       │   │   │   │       └── page.js
│       │   │   │   └── new
│       │   │   │       └── page.js
│       │   │   ├── login
│       │   │   │   └── page.js
│       │   │   └── page.js
│       │   ├── favicon.ico
│       │   ├── globals.css
│       │   ├── layout.js
│       │   ├── ledger
│       │   │   └── page.js
│       │   ├── page.js
│       │   └── test-cursor
│       │       └── page.js
│       ├── components
│       │   ├── AbyssProvider.jsx
│       │   ├── GuestIntakeForm.jsx
│       │   ├── portal
│       │   │   ├── GlobalFeed.jsx
│       │   │   └── GuestDirectory.jsx
│       │   └── ui
│       │       ├── ambient-aurora.jsx
│       │       ├── custom-cursor.jsx
│       │       ├── encrypted-text.jsx
│       │       ├── interactive-aura.jsx
│       │       └── luma-dropdown.jsx
│       ├── lib
│       │   └── utils.js
│       ├── proxy.js
│       └── services
│           └── api.js
└── prompt.md
```

## Detailed File and Folder Definitions

### Root Folders and Files

- **`.` (Root Folder):** The top-level workspace that houses the entire project, splitting the architecture into standalone `backend` and `frontend` applications.
- **`README.md` (Root):** Master architecture overview documenting main principles, global milestones, architecture terminology (Tenants/Nodes, Global Ledger, Control Plane), and tech stack.
- **`prompt.md` (Root):** This document itself, which contains a generated comprehensive breakdown of the project status and architecture.

### Backend (`/backend`)
The backend is an Express.js Node application. It serves the REST API, manages PostgreSQL connectivity (Aiven), encapsulates the Data Layer, provides real-time WebSocket infrastructure (The Abyss), and enforces strict telemetry via server-side logging.

- **`backend/.gitignore`:** Excludes `node_modules`, `.env`, and other untracked or sensitive backend files from version control.
- **`backend/README.md`:** Details the specific backend setup process (requires Aiven DB via `pg`), documents the folder structure, and mandates the rigorous "Telemetry Rule."
- **`backend/package.json`:** Defines the Node.js dependencies for the backend, such as express, socket.io, ioredis, pg, bcrypt, and configures CLI scripts (like `dev` and `start`).
- **`backend/package-lock.json`:** Locks backend dependency versions to ensure deterministic and consistent installations across environments.
- **`backend/migrate.js`:** A command-line script serving as an entry point to manually or automatically run database schema migrations (often calling `setupDb.js`).

#### Database (`backend/database`)
Contains SQL assets to bootstrap or mutate the database state.
- **`backend/database/init.sql`:** The master SQL script to initialize tables (e.g., `events`, `event_images`, `guests`, `event_registrations`, `event_schedules`) with precise constraints, unique indices, and foreign keys. Installs necessary PostgreSQL extensions (like UUID).

#### Scripts (`backend/scripts`)
Utilities to automate initial environment bootstrapping and maintenance.
- **`backend/scripts/printSchema.js`:** A utility script that prints the current PostgreSQL database schema out to the console. Useful for debugging or verifying successful migrations.
- **`backend/scripts/setupDb.js`:** A programmatic script that connects to the Aiven PostgreSQL ledger and executes the `init.sql` blueprint to inject base records or structures upon initial setup.

#### Source Code (`backend/src`)
The `src` folder houses all server-side application logic, separated by domain and architectural layers.

**`backend/src/config/`**
Contains the core system connection configurations.
- **`backend/src/config/cache.js`:** Configures and connects to the Valkey/Redis cache layer using `ioredis`. Handles error recovery and tuning for high-performance pub/sub operations.
- **`backend/src/config/db.js`:** Configures the PostgreSQL connection pool setup using the `pg` library. Expects an SSL-secured `DATABASE_URL` for secure Aiven connectivity.

**`backend/src/controllers/`**
Express route handlers that separate core business logic from routing, managing requests and responses.
- **`backend/src/controllers/abyssController.js`:** The central control hub for The Abyss (WebSockets). Handles ephemeral mesh logic, storing and routing real-time echos, managing direct messaging, tracking socket connection states, and coordinating with `meshDissolver`.
- **`backend/src/controllers/authController.js`:** Manages administrative control plane authentication, including handling admin login procedures and validating credentials to issue JWT access tokens.
- **`backend/src/controllers/eventController.js`:** Handles the full CRUD lifecycle for Event Tenants. Includes complex database querying logic (`json_agg` for image associations) and dispatches Vercel Edge proxy routing updates via the Vercel Service.
- **`backend/src/controllers/guestController.js`:** Manages attendee (guest) onboarding, ticket registrations, guest profiles, JWT token minting for attendees, and querying ephemeral state (like echos and presence).
- **`backend/src/controllers/tenantController.js`:** Enforces RBAC logic for Organization and User provisioning. Handles creating distinct organizational tenants, provisioning staff accounts, assigning permissions to specific events, and guaranteeing database integrity during deletions.

**`backend/src/middleware/`**
Request interceptors that authenticate and authorize requests before reaching controllers.
- **`backend/src/middleware/authMiddleware.js`:** Secures REST API endpoints by parsing JWT tokens. Enforces Role-Based Access Control (`requireSuperadmin`, `requireTenantAdmin`) and guards against IDOR attacks by shielding guest routes (`requireGuestToken`).
- **`backend/src/middleware/socketAuth.js`:** The perimeter defense for WebSockets. Validates JWT payloads attached to socket handshake headers to authorize users entering The Abyss.

**`backend/src/routes/`**
Registers HTTP API paths and routes them directly to corresponding controller actions.
- **`backend/src/routes/authRoutes.js`:** Binds endpoints for admin login and session creation (mounted under `/api/auth`).
- **`backend/src/routes/eventRoutes.js`:** Binds endpoints for retrieving, updating, creating, and deleting Event data (mounted under `/api/events`).
- **`backend/src/routes/guestRoutes.js`:** Binds endpoints for managing attendees within specific event nodes, including global admin oversight routes (mounted under `/api/guests`).
- **`backend/src/routes/tenantRoutes.js`:** Binds endpoints for superadmin/tenant admin management of platform organizations and network staff users (mounted under `/api/tenants`).

**`backend/src/server.js`**
The master entrypoint and Control Plane boot sequence. Wraps the Express app with an HTTP server, configures CORS, mounts Socket.io (The Abyss), establishes Valkey scaling, mounts API route endpoints, starts background CRON jobs (like the `meshDissolver`), and connects the Database and Cache layers.

**`backend/src/services/`**
Encapsulates external API integrations and advanced, asynchronous background orchestration.
- **`backend/src/services/emailService.js`:** Dispatches transactional emails (e.g. Access Codes, Mesh Exports) utilizing a direct HTTPS REST API transport (like Resend) to effectively bypass common SMTP port blockages.
- **`backend/src/services/meshDissolver.js`:** An ephemeral CRON background worker. It routinely queries for expired event Nodes, dissolves the ephemeral websocket mesh, persists network connections directly to the Global Ledger, and dispatches automated email exports to attendees.
- **`backend/src/services/vercelService.js`:** Integrates directly with Vercel APIs for dynamic project infrastructure management. Used to dynamically inject and purge custom domain edge routing logic for MSaaS white-labeling.

**`backend/src/utils/`**
Shared helper functions and standalone administrative scripts.
- **`backend/src/utils/createAdmin.js`:** A CLI utility script to securely bcrypt hash a password and manually seed a root administrative superuser account directly into the PostgreSQL Global Ledger.
- **`backend/src/utils/logger.js`:** Implements the required "Telemetry Rule." Provides a standardized logging mechanism utilizing formatted timestamps, execution context tagging, and clear log levels (INFO, WARN, ERROR).
- **`backend/src/utils/migrateAbyss.js`:** An ad-hoc database schema mutation script that adds the `mesh_dissolved` boolean state to track The Abyss lifecycle in the database.
- **`backend/src/utils/migrateThemes.js`:** An ad-hoc schema migration script that expands the MSaaS platform for Edge-Rendering configurations, adding domain routing identifiers and theme configuration columns.

### Frontend (`/frontend`)
The presentation layer built on the Next.js 14+ App Router, utilizing React, Tailwind CSS v4, and Framer Motion. Engineered specifically for GPU performance optimization and delivering cinematic UI/UX visuals.

- **`frontend/.gitignore`:** Excludes local build directories (`.next`), node modules (`node_modules`), and secrets from version control.
- **`frontend/README.md`:** Details the frontend tech stack, setup process, UI architecture philosophies (such as hardware acceleration), the App Router file layout, and animation capabilities using Framer Motion.
- **`frontend/components.json`:** Contains configuration for Shadcn/UI integration, linking generic component aliases to actual standard local folder paths.
- **`frontend/eslint.config.mjs`:** Custom ESLint configuration leveraging Next.js Core Web Vitals rules to ensure code quality and performance standards.
- **`frontend/jsconfig.json`:** Configures JavaScript path aliases (like mapping `@/*` to `./src/*`), cleaning up module imports across the source code.
- **`frontend/next.config.mjs`:** The core Next.js framework configuration. Exposes necessary environment variables and specifically whitelists remote image source patterns from domains like `i.postimg.cc`.
- **`frontend/package.json`:** Declares frontend Node.js dependencies (e.g., Tailwind, Framer Motion, Next.js, socket.io-client) and defines project npm scripts (like `dev`, `build`, `start`, and `test`).
- **`frontend/package-lock.json`:** Locks frontend dependency versions ensuring stable UI builds across all deployment environments.
- **`frontend/postcss.config.mjs`:** Configures the PostCSS loader toolchain, integrating the `@tailwindcss/postcss` plugin to parse Tailwind utility classes.

#### Public Assets (`frontend/public/`)
Static public assets served directly by the web server.
- **`frontend/public/file.svg`:** A standard placeholder file icon.
- **`frontend/public/globe.svg`:** A standard globe icon vector graphic.
- **`frontend/public/next.svg`:** The Next.js brand logo vector.
- **`frontend/public/vercel.svg`:** The Vercel brand logo vector.
- **`frontend/public/window.svg`:** A standard placeholder window icon graphic.

#### Source Code (`frontend/src/`)
Contains all React view components, layout templates, utility functions, and API wrappers used by Next.js.

**`frontend/src/app/`**
Next.js App Router root defining the nested directory and route structure.
- **`frontend/src/app/favicon.ico`:** The default favicon for the web application.
- **`frontend/src/app/globals.css`:** The master, global CSS stylesheet. It injects Tailwind CSS utility layers, configures custom webkit scrollbars, and sets extensive dark/light mode OKLCH CSS variables to establish the premium platform aesthetic.
- **`frontend/src/app/layout.js`:** The root layout component enveloping the entire HTML structure. It loads Google Fonts (Geist) and globally mounts components like the `CustomCursor`.
- **`frontend/src/app/page.js`:** The Global Public Directory index path (`/`). This landing page retrieves all active public events and showcases an interactive `EncryptedText` banner positioned over an `AmbientAurora` background.

**`frontend/src/app/ledger/`**
- **`frontend/src/app/ledger/page.js`:** A dedicated administrative or analytical page designed for viewing global ledger data, including active events and overarching guest metrics.

**`frontend/src/app/test-cursor/`**
- **`frontend/src/app/test-cursor/page.js`:** A developer sandbox testing page configured specifically for experimenting with and visually debugging custom GPU-accelerated cursor animations.

**`frontend/src/app/[eventSlug]/`**
Dynamic route grouping serving as an isolated Tenant/Node context for individual events.
- **`frontend/src/app/[eventSlug]/page.js`:** The public-facing Event Hub homepage detailing context for a specific event node (`/[eventSlug]`).
- **`frontend/src/app/[eventSlug]/register/page.js`:** The guest onboarding page. Houses the `GuestIntakeForm` for collecting user credentials (`/[eventSlug]/register`).

**`frontend/src/app/[eventSlug]/portal/`**
Gated access area for approved attendees post-registration.
- **`frontend/src/app/[eventSlug]/portal/page.js`:** The Portal login lobby screen where returning guests input their access codes to verify entry permissions (`/[eventSlug]/portal`).
- **`frontend/src/app/[eventSlug]/portal/dashboard/page.js`:** The interior interactive dashboard of an event portal. Wraps child components inside the `AbyssProvider` to ensure real-time websocket connectivity for the `GlobalFeed` and `GuestDirectory`.

**`frontend/src/app/admin/`**
The overarching Control Plane dashboard interfaces.
- **`frontend/src/app/admin/page.js`:** The main administrative dashboard overview tailored for platform managers, listing deployed events and globally synced metrics.
- **`frontend/src/app/admin/login/page.js`:** The secure authentication gateway page demanding admin vault credentials before allowing Control Plane access.

**`frontend/src/app/admin/events/`**
Control Plane sub-routes for event modification.
- **`frontend/src/app/admin/events/new/page.js`:** Administrative form interface utilized to configure and deploy a brand new Event node into the system.
- **`frontend/src/app/admin/events/[eventSlug]/edit/page.js`:** Administrative form interface enabling the editing or teardown of an existing deployed Event node.

**`frontend/src/app/admin/[eventSlug]/`**
- **`frontend/src/app/admin/[eventSlug]/page.js`:** An admin-specific detailed ledger view of an individual Node's metrics, enabling managers to oversee attendees and internal node states.

**`frontend/src/components/`**
Reusable, encapsulated React component blocks.
- **`frontend/src/components/AbyssProvider.jsx`:** A Global React Context component linking the `socket.io-client` with the backend Abyss engine to broadcast presence and sync real-time application states.
- **`frontend/src/components/GuestIntakeForm.jsx`:** The client-side, interactive form module securely collecting new guest registrations and transmitting the payloads via API.

**`frontend/src/components/portal/`**
Complex components rendered exclusively inside the gated portal environment.
- **`frontend/src/components/portal/GlobalFeed.jsx`:** A real-time chat timeline or feed component pulling live echos (messages) and broadcasting outgoing ones over the Abyss network.
- **`frontend/src/components/portal/GuestDirectory.jsx`:** A real-time, interactive user list directory allowing attendees to discover others, view online presence, and initiate direct network messaging within a specific mesh node.

**`frontend/src/components/ui/`**
Low-level, atomic UI components engineered for high style and often heavily relying on Framer Motion GPU transitions.
- **`frontend/src/components/ui/ambient-aurora.jsx`:** A fully hardware-accelerated, zero-blur dynamic radial gradient backdrop graphic ensuring a 60fps cinematic background aesthetic without straining system resources.
- **`frontend/src/components/ui/custom-cursor.jsx`:** Overrides the native OS cursor with an interactive, animated alternative. Tracks raw mouse coordinates and applies linear interpolation (LERP) liquid ring trailing effects.
- **`frontend/src/components/ui/encrypted-text.jsx`:** A styled text component that delivers a visual scrambling "decoding" effect via rapid interval-based character swapping.
- **`frontend/src/components/ui/interactive-aura.jsx`:** A lobotomized, neutral placeholder component retained for strict architectural backwards-compatibility but designed to return null to free up GPU rendering cycles.
- **`frontend/src/components/ui/luma-dropdown.jsx`:** A deeply styled, Framer Motion-animated, interactive generic dropdown menu equipped with smart directional (up/down) rendering anchors.

**`frontend/src/lib/`**
Generic, framework-agnostic helper functions specific to the frontend environment.
- **`frontend/src/lib/utils.js`:** Common shared utility functions, primarily exporting a customized `cn` function utilized to dynamically merge Tailwind CSS class strings avoiding syntax conflicts.

**`frontend/src/proxy.js`**
Vercel Edge Middleware. Dynamically intercepts requests navigating to custom whitelabel domains, resolves them internally to backend Tenant Nodes/Events, intelligently injects theme data inside request headers, and purposely bypasses static local file paths to optimize GPU/Network performance.

**`frontend/src/services/`**
Client-side network API wrapper modules.
- **`frontend/src/services/api.js`:** A centralized `fetch` function wrapper exposing specific semantic functions (e.g. `registerGuest`, `fetchPublicEvents`) orchestrating all network communication directly back to backend REST endpoints. Robustly sanitizes base URLs and parses error payloads.

update prompt.md file in root folder containing everything, our main goal, complete project structure in detail including every file and folder (except node_modules), what is done in the project and what can it do, its capabilities and first read every file then define each file in detail about what it does and define each folder about what it does and in the end of the file copy this prompt