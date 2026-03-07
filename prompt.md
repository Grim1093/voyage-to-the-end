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

## Complete Project Structure

```text
.
├── README.md
├── prompt.md
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
└── frontend
    ├── .gitignore
    ├── README.md
    ├── components.json
    ├── eslint.config.mjs
    ├── jsconfig.json
    ├── next.config.mjs
    ├── package-lock.json
    ├── package.json
    ├── postcss.config.mjs
    ├── public
    │   ├── file.svg
    │   ├── globe.svg
    │   ├── next.svg
    │   ├── vercel.svg
    │   └── window.svg
    └── src
        ├── app
        │   ├── [eventSlug]
        │   │   ├── page.js
        │   │   ├── portal
        │   │   │   ├── dashboard
        │   │   │   │   └── page.js
        │   │   │   └── page.js
        │   │   └── register
        │   │       └── page.js
        │   ├── admin
        │   │   ├── [eventSlug]
        │   │   │   └── page.js
        │   │   ├── events
        │   │   │   ├── [eventSlug]
        │   │   │   │   └── edit
        │   │   │   │       └── page.js
        │   │   │   └── new
        │   │   │       └── page.js
        │   │   ├── login
        │   │   │   └── page.js
        │   │   └── page.js
        │   ├── favicon.ico
        │   ├── globals.css
        │   ├── layout.js
        │   ├── page.js
        │   └── test-cursor
        │       └── page.js
        ├── components
        │   ├── AbyssProvider.jsx
        │   ├── GuestIntakeForm.jsx
        │   ├── portal
        │   │   ├── GlobalFeed.jsx
        │   │   └── GuestDirectory.jsx
        │   └── ui
        │       ├── ambient-aurora.jsx
        │       ├── custom-cursor.jsx
        │       ├── encrypted-text.jsx
        │       ├── interactive-aura.jsx
        │       └── luma-dropdown.jsx
        ├── lib
        │   └── utils.js
        ├── proxy.js
        └── services
            └── api.js
```

## Detailed File and Folder Definitions

### Root Level
- **`.`**: The root of the project ecosystem.
- **`README.md`**: Master architecture overview detailing main principles, global milestones, architecture terminology (Tenants/Nodes, Global Ledger, Control Plane), and tech stack.
- **`prompt.md`**: This generated comprehensive breakdown of the project status and architecture (including the original prompt).

### Backend (`/backend`)
Handles the API, PostgreSQL connectivity (Aiven), Data Layer, and strict telemetry via server-side logging. Runs on Node.js/Express.js.
- **`backend/.gitignore`**: Excludes `node_modules`, `.env`, and other non-tracked backend assets from git.
- **`backend/README.md`**: Details backend setup (requires Aiven DB via `pg`), folder structure, and the rigorous "Telemetry Rule".
- **`backend/package.json` & `package-lock.json`**: Dependencies and scripts for the backend Node.js application.
- **`backend/database/`**: Contains raw SQL files and logic for db structuring.
  - **`init.sql`**: SQL scripts to initialize tables (e.g. `events`, `event_images`, `guests`, `event_registrations`) with precise schema constraints.
- **`backend/migrate.js`**: Command-line entry point to manually or automatically run database migrations.
- **`backend/scripts/`**: Utilities for initial environment bootstrapping.
  - **`setupDb.js`**: Script to connect and inject base records or structures upon initial setup.
- **`backend/src/`**: Source folder for all server-side application logic.
  - **`config/`**: Contains system configurations.
    - **`cache.js`**: Manages cache layer configuration for performance tuning.
    - **`db.js`**: PostgreSQL connection pool setup via the `pg` library. Expects `sslmode=require` for Aiven connectivity.
  - **`controllers/`**: Express route handlers separating business logic from routing.
    - **`abyssController.js`**: Handles logic specific to "Abyss", presumably an advanced backend service or data extraction toolset based on the premium MSaaS naming.
    - **`authController.js`**: Handles administrative control plane authentication.
    - **`eventController.js`**: Handles full CRUD lifecycle for Event Tenants. Includes complex querying logic (`json_agg` for image associations).
    - **`guestController.js`**: Manages guest onboarding, profiles, and associated records.
  - **`middleware/`**: Request interceptors.
    - **`authMiddleware.js`**: Protects secure admin/control plane routes.
    - **`socketAuth.js`**: Authentication mechanisms specifically tailored for WebSockets/real-time communication layers.
  - **`routes/`**: Defines HTTP API paths and routes them to appropriate controllers.
    - **`authRoutes.js`**: Routes for admin login/session creation.
    - **`eventRoutes.js`**: Routes for retrieving, modifying, creating, and deleting Events.
    - **`guestRoutes.js`**: Routes for managing attendees within a node.
  - **`server.js`**: The main Express server entry point. Configures middleware, attaches routes, and starts listening on the defined `PORT`.
  - **`services/`**: Encapsulates external API integrations and advanced asynchronous background tasks.
    - **`emailService.js`**: For transactional email dispatching.
    - **`meshDissolver.js`**: A specialized service, likely for image/asset processing or visual background manipulation for the cinematic aesthetic.
    - **`vercelService.js`**: Integrations with Vercel APIs (e.g., dynamically provisioning subdomains or triggering deployments for new nodes).
  - **`utils/`**: Shared helper functions.
    - **`createAdmin.js`**: Utility script to seed an administrative root account into the database.
    - **`logger.js`**: Implements the "Telemetry Rule". A custom utility heavily utilized to log every step of the data pipeline.
    - **`migrateAbyss.js` & `migrateThemes.js`**: Utilities for migrating advanced aesthetic settings or legacy data structures to new formats.

### Frontend (`/frontend`)
The presentation layer built on Next.js 14+ App Router, utilizing React, Tailwind CSS, and Framer Motion. Engineered for GPU optimization and cinematic UI/UX.
- **`frontend/.gitignore`**: Excludes local builds (`.next`), dependencies (`node_modules`), and secrets.
- **`frontend/README.md`**: Outlines the frontend tech stack, setup process, and the core philosophies: hardware acceleration, App Router structures, and Framer Motion capabilities.
- **`frontend/components.json`**: Likely a configuration file for a UI library generator (e.g., shadcn/ui).
- **`frontend/eslint.config.mjs` & `jsconfig.json` & `postcss.config.mjs`**: Code linting, JavaScript language support, and Tailwind CSS transformation settings.
- **`frontend/next.config.mjs`**: Next.js core framework configurations (routing rewrites, external image domains, performance tweaks).
- **`frontend/package.json` & `package-lock.json`**: Dependencies (Tailwind, Framer Motion, Next.js, etc.) and scripts.
- **`frontend/public/`**: Static public assets (`.svg` files).
- **`frontend/proxy.js`**: A proxy configuration for handling requests between the frontend and backend efficiently during local dev, bypassing CORS complexities.
- **`frontend/src/`**: Main directory containing all view, component, and logic layers.
  - **`app/`**: Next.js App Router root.
    - **`favicon.ico`**, **`globals.css`**, **`layout.js`**: Global site settings, Tailwind imports, and root application wrapper.
    - **`page.js`**: The Global Public Directory. The entry point displaying all accessible global nodes.
    - **`[eventSlug]/`**: Dynamic route grouping representing isolated Tenant/Node contexts.
      - **`page.js`**: The public-facing Event Hub homepage for a specific event node.
      - **`portal/`**: Post-registration, gated access areas for approved guests.
        - **`page.js`**: Portal root/lobby.
        - **`dashboard/page.js`**: Inside the event portal, containing personal schedules or networking feeds.
      - **`register/page.js`**: The onboarding page where a guest applies to attend a node.
    - **`admin/`**: The Control Plane.
      - **`page.js`**: Main dashboard overview for platform admins.
      - **`login/page.js`**: Authentication gateway for the Control Plane.
      - **`events/`**: Control Plane event management.
        - **`new/page.js`**: Interface to create a brand new Event node.
        - **`[eventSlug]/edit/page.js`**: Interface to modify existing Event nodes.
      - **`[eventSlug]/page.js`**: Admin-specific view of a particular node's metrics and settings.
    - **`test-cursor/page.js`**: A sandbox page for experimenting with custom GPU-accelerated cursor animations.
  - **`components/`**: Reusable React components.
    - **`AbyssProvider.jsx`**: A React Context provider handling global application state, likely associated with premium UI capabilities.
    - **`GuestIntakeForm.jsx`**: Reusable form component to handle guest registrations securely.
    - **`portal/`**: Components exclusively used within the gated `app/[eventSlug]/portal/` environment.
      - **`GlobalFeed.jsx`**: A real-time timeline/feed component for event updates.
      - **`GuestDirectory.jsx`**: An interface to discover and view other attendees at a specific node.
    - **`ui/`**: Low-level, generic, or highly styled atomic components.
      - **`ambient-aurora.jsx`**: A hardware-accelerated, custom zero-blur radial gradient backdrop component ensuring 60fps cinematic feel.
      - **`custom-cursor.jsx`**: Replaces the default OS cursor with an interactive, animated variant.
      - **`encrypted-text.jsx`**: Text component that provides a visually interesting "decoding" or "scrambling" visual effect on appearance.
      - **`interactive-aura.jsx`**: A component emitting a subtle interactive glow effect, reacting to user interaction.
      - **`luma-dropdown.jsx`**: A highly styled, interactive dropdown menu mimicking high-end UI systems (like Luma).
  - **`lib/`**: Generic, UI-agnostic helper functions for the frontend.
    - **`utils.js`**: Common utilities (e.g., Tailwind class merging with `clsx` and `tailwind-merge`).
  - **`services/`**: Client-side API fetching utilities.
    - **`api.js`**: Functions utilizing `fetch` or `axios` to communicate with the backend (`/backend/src/routes`).

---

create a new prompt.md file in root folder containing everything, our main goal, complete project structure in detail including every file and folder (except node_modules), what is done in the project and what can it do, its capabilities and define each file in detail about what it does and define each faldder about what it does
and in the end  of the file copy this prompt
