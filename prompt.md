# Master Architecture & Project Overview

## Main Goal
The core goal of this repository is to provide a high-end, multi-tenant MICE (Meetings, Incentives, Conferences, and Exhibitions) platform. It operates as a Multi-Software as a Service (MSaaS) and is engineered to deliver unparalleled performance and visual fidelity for premium events.

## What is done & Capabilities
- **Multi-Tenant Architecture:** Capable of hosting isolated events (Tenants/Nodes) within a broader MSaaS ecosystem.
- **Global Ledger:** Fully operational PostgreSQL database hosted on Aiven, enforcing strict UTC timezones for all timestamps.
- **Admin Control Plane:** Live management dashboard used for system-wide configuration, node deployment, and event management.
- **Advanced UI/UX Architecture:**
  - Ultra-premium, dark-mode, cinematic aesthetics.
  - Hardware Acceleration: Complex visual effects like moving CSS Gaussian blurs have been eliminated in favor of Framer Motion and GPU-accelerated concurrent z-index fading and ambient-aurora gradients.
  - Graceful UI Degradation across varying network and device capabilities.
  - Custom React Server Components and Next.js App Router for high-performance navigation and rendering.
- **Global Directory:** Public-facing hub for discovering and accessing events.
- **Telemetry Rule:** Comprehensive server-side logging at every step of the backend data pipeline.
- **The Abyss (Transport Layer):** WebSocket and Valkey (Redis) integration for real-time mesh connectivity. Ephemeral event meshes and direct messaging between guests.

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
│   │   └── setupDb.js
│   └── src
│       ├── config
│       │   ├── cache.js
│       │   └── db.js
│       ├── controllers
│       │   ├── abyssController.js
│       │   ├── authController.js
│       │   ├── eventController.js
│       │   └── guestController.js
│       ├── middleware
│       │   ├── authMiddleware.js
│       │   └── socketAuth.js
│       ├── routes
│       │   ├── authRoutes.js
│       │   ├── eventRoutes.js
│       │   └── guestRoutes.js
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
│       └── services
│           └── api.js
└── prompt.md
```

## Detailed File and Folder Definitions

### Root Level
- **`. `**: The root of the project ecosystem.
- **`README.md`**: Master architecture overview detailing main principles, global milestones, architecture terminology (Tenants/Nodes, Global Ledger, Control Plane), and tech stack.
- **`prompt.md`**: This generated comprehensive breakdown of the project status and architecture (including the original prompt).

### Backend (`/backend`)
Handles the API, PostgreSQL connectivity (Aiven), Data Layer, real-time WebSocket infrastructure (The Abyss), and strict telemetry via server-side logging. Runs on Node.js/Express.js.
- **`backend/.gitignore`**: Excludes `node_modules`, `.env`, and other non-tracked backend assets from git.
- **`backend/README.md`**: Details backend setup (requires Aiven DB via `pg`), folder structure, and the rigorous "Telemetry Rule".
- **`backend/package.json` & `package-lock.json`**: Dependencies and scripts for the backend Node.js application, including express, socket.io, ioredis, pg.
- **`backend/migrate.js`**: Command-line entry point to manually or automatically run database migrations (calls `setupDb.js`).
- **`backend/database/`**: Contains raw SQL files and logic for db structuring.
  - **`init.sql`**: SQL scripts to initialize tables (e.g., `events`, `event_images`, `guests`, `event_registrations`, `direct_messages`) with precise schema constraints and foreign keys. Includes UUID extension.
- **`backend/scripts/`**: Utilities for initial environment bootstrapping.
  - **`setupDb.js`**: Script to connect to Aiven PostgreSQL and execute the `init.sql` blueprint to inject base records or structures upon initial setup.
- **`backend/src/`**: Source folder for all server-side application logic.
  - **`config/`**: Contains system configurations.
    - **`cache.js`**: Manages Valkey/Redis cache layer configuration for performance tuning and pub/sub.
    - **`db.js`**: PostgreSQL connection pool setup via the `pg` library. Expects `sslmode=require` for Aiven connectivity.
  - **`controllers/`**: Express route handlers separating business logic from routing, as well as WebSocket handlers.
    - **`abyssController.js`**: Central control hub for The Abyss (WebSockets). Handles ephemeral mesh logic, echos, direct messaging, and socket connection states.
    - **`authController.js`**: Handles administrative control plane authentication (Admin Login logic).
    - **`eventController.js`**: Manages full CRUD lifecycle for Event Tenants. Includes complex querying logic (`json_agg` for image associations). Uses VercelService.
    - **`guestController.js`**: Manages guest onboarding, profiles, JWT token minting, and associated records.
  - **`middleware/`**: Request interceptors.
    - **`authMiddleware.js`**: REST API protection. Secures admin routes with JWT verification (`requireAdminKey`) and guest routes with Anti-IDOR shields (`requireGuestToken`).
    - **`socketAuth.js`**: Perimeter defense for WebSockets. Validates JWT payloads from socket handshakes to authenticate users into The Abyss.
  - **`routes/`**: Defines HTTP API paths and routes them to appropriate controllers.
    - **`authRoutes.js`**: Routes for admin login/session creation (`/api/auth`).
    - **`eventRoutes.js`**: Routes for retrieving, modifying, creating, and deleting Events (`/api/events`).
    - **`guestRoutes.js`**: Routes for managing attendees within a node, including global admin view (`/api/guests`).
  - **`server.js`**: The master Control Plane boot sequence. Wraps Express with an HTTP server, configures CORS, mounts Socket.io (The Abyss), establishes Valkey scaling, mounts routes, and initiates DB/Cache uplinks.
  - **`services/`**: Encapsulates external API integrations and advanced asynchronous background tasks.
    - **`emailService.js`**: Dispatches transactional emails via direct HTTPS REST API transport (e.g. Resend) to bypass SMTP firewall issues.
    - **`meshDissolver.js`**: Ephemeral CRON worker responsible for querying expired Nodes and initiating their teardown/archival process.
    - **`vercelService.js`**: Integrations with Vercel APIs for dynamic project management.
  - **`utils/`**: Shared helper functions.
    - **`createAdmin.js`**: CLI utility script to securely hash a password and seed an administrative root account into the Global Ledger.
    - **`logger.js`**: The core of the "Telemetry Rule." Standardizes logging with formatted timestamps, context, and levels (INFO, WARN, ERROR).
    - **`migrateAbyss.js`**: Schema mutation script injecting states like `mesh_dissolved` to track The Abyss lifecycle in the database.
    - **`migrateThemes.js`**: Schema migration script upgrading the MSaaS for Edge-Rendering and theme configurations.

### Frontend (`/frontend`)
The presentation layer built on Next.js 14+ App Router, utilizing React, Tailwind CSS v4, and Framer Motion. Engineered for GPU optimization and cinematic UI/UX.
- **`frontend/.gitignore`**: Excludes local builds (`.next`), dependencies (`node_modules`), and secrets.
- **`frontend/README.md`**: Outlines the frontend tech stack, setup process, and the core philosophies: hardware acceleration, App Router structures, and Framer Motion capabilities.
- **`frontend/components.json`**: Shadcn/UI configuration linking aliases to standard paths.
- **`frontend/eslint.config.mjs`**: Custom ESLint configuration leveraging Next.js web vitals rules.
- **`frontend/jsconfig.json`**: Sets up absolute import paths (e.g., `@/*`).
- **`frontend/next.config.mjs`**: Next.js core framework configurations, specifically allowing remote image patterns from domains like `i.postimg.cc`.
- **`frontend/package.json` & `package-lock.json`**: Dependencies (Tailwind, Framer Motion, Next.js, socket.io-client) and scripts.
- **`frontend/postcss.config.mjs`**: Configures PostCSS with the `@tailwindcss/postcss` plugin.
- **`frontend/public/`**: Static public assets (`.svg` files).
  - **`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`**: Standard static images.
- **`frontend/src/`**: Main directory containing all view, component, and logic layers.
  - **`app/`**: Next.js App Router root defining the directory structure.
    - **`favicon.ico`**: Site icon.
    - **`globals.css`**: Master stylesheet injecting Tailwind CSS, custom scrollbars, and extensive dark/light mode OKLCH color variables for the premium aesthetic.
    - **`layout.js`**: The Root Layout defining HTML structure, loading Google Fonts (Geist), and mounting the global CustomCursor component.
    - **`page.js`**: The Global Public Directory (`/`). Landing page retrieving public events and displaying an EncryptedText banner over an AmbientAurora.
    - **`test-cursor/page.js`**: A sandbox page for experimenting with custom GPU-accelerated cursor animations.
    - **`[eventSlug]/`**: Dynamic route grouping representing isolated Tenant/Node contexts.
      - **`page.js`**: The public-facing Event Hub homepage for a specific event node (`/[eventSlug]`).
      - **`register/page.js`**: Onboarding page housing the GuestIntakeForm (`/[eventSlug]/register`).
      - **`portal/`**: Post-registration, gated access areas for approved guests.
        - **`page.js`**: Portal login lobby for returning guests to verify their access code (`/[eventSlug]/portal`).
        - **`dashboard/page.js`**: Inside the event portal. Wraps child components in the AbyssProvider for real-time mesh connectivity and renders GlobalFeed/GuestDirectory.
    - **`admin/`**: The Control Plane.
      - **`page.js`**: Main dashboard overview for platform admins, showing active events and global guests.
      - **`login/page.js`**: Authentication gateway requiring the admin vault credentials.
      - **`events/`**: Control Plane event management.
        - **`new/page.js`**: Form interface to deploy a brand new Event node.
        - **`[eventSlug]/edit/page.js`**: Form interface to modify details of an existing Event node.
      - **`[eventSlug]/page.js`**: Admin-specific ledger view of a particular node's metrics, managing guests and states.
  - **`components/`**: Reusable React components.
    - **`AbyssProvider.jsx`**: Global React Context connecting `socket.io-client` to the backend Abyss engine for real-time state.
    - **`GuestIntakeForm.jsx`**: Client-side form securely managing guest registrations payload and API communication.
    - **`portal/`**: Components exclusively used within the gated `app/[eventSlug]/portal/` environment.
      - **`GlobalFeed.jsx`**: A real-time timeline/feed component pushing and pulling echos (messages) via the Abyss.
      - **`GuestDirectory.jsx`**: Real-time interface to discover, view presence, and directly message other attendees in the specific mesh node.
    - **`ui/`**: Low-level, generic, highly styled atomic components (frequently utilizing Framer Motion).
      - **`ambient-aurora.jsx`**: A hardware-accelerated, zero-blur radial gradient backdrop component ensuring 60fps cinematic feel.
      - **`custom-cursor.jsx`**: Replaces default OS cursor with an interactive, animated variant tracking raw mouse coordinates and applying LERP liquid rings.
      - **`encrypted-text.jsx`**: Text component providing a scrambling visual "decoding" effect via interval-based character swapping.
      - **`interactive-aura.jsx`**: A lobotomized (neutralized) component maintained for architecture compatibility but returning null to save GPU cycles.
      - **`luma-dropdown.jsx`**: Highly styled, Framer Motion-animated interactive dropdown menu.
  - **`lib/`**: Generic, UI-agnostic helper functions for the frontend.
    - **`utils.js`**: Common utilities exporting a `cn` function for merging Tailwind classes with `clsx` and `tailwind-merge`.
  - **`services/`**: Client-side API fetching utilities.
    - **`api.js`**: Centralized fetch wrapper exposing functions (e.g. `registerGuest`, `fetchPublicEvents`) to communicate with the backend REST endpoints. Includes response parsing and base URL sanitization.

---

update prompt.md file in root folder containing everything, our main goal, complete project structure in detail including every file and folder (except node_modules), what is done in the project and what can it do, its capabilities and first read every file then  define each file in detail about what it does and define each folder about what it does and in the end of the file copy this prompt
