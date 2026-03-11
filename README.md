# Master Architecture & Project Overview

## High-Level Summary
Welcome to the core repository of our high-end, multi-tenant MICE (Meetings, Incentives, Conferences, and Exhibitions) platform. Operating as a Multi-Software as a Service (MSaaS), this platform is engineered to deliver unparalleled performance and visual fidelity for premium events.

## Design Philosophy
The system aesthetic is **ultra-premium, dark-mode, cinematic, and hardware-accelerated**. Drawing inspiration from industry leaders like Vercel, Linear, and Apple TV, the UI prioritizes:
- **Cinematic Visuals:** Deep contrasts, subtle gradients, and immersive imagery.
- **Hardware Acceleration:** Offloading animations and transitions to the GPU for buttery smooth 60fps performance.
- **Graceful UI Degradation:** Ensuring usability and accessibility are maintained across varying network speeds and device capabilities without sacrificing the core aesthetic.

## Global Achievements
To date, the platform has accomplished the following global milestones:
- **Database Migrated:** A robust PostgreSQL architecture hosted on Aiven is fully operational.
- **Admin Control Plane Active:** The central management dashboard is live, enabling seamless oversight of all nodes.
- **GPU Performance Optimized:** Eliminated expensive CSS operations (like moving Gaussian blurs) in favor of hardware-accelerated alternatives (e.g., concurrent z-index fading, optimized next/image loading).
- **Global Directory Built:** A public-facing hub for discovering and accessing events is fully functional.

## System Terminology
To maintain consistency across the codebase, please adhere to the following terminology:
- **Tenants / Nodes:** Events. Each event operates as an isolated node within the MSaaS ecosystem.
- **Global Ledger:** The PostgreSQL database acting as the single source of truth for all data.
- **Control Plane:** The admin dashboard used for system-wide configuration and event management.

## Global Tech Stack
- **Frontend:** Next.js (App Router), React, Tailwind CSS, Framer Motion, `next/image`.
- **Backend:** Node.js, Express.js.
- **Database:** PostgreSQL (hosted on Aiven) accessed via `pg` pool.

## Database Architecture
The Global Ledger is built on PostgreSQL hosted on Aiven via `pg` pool, with all timezones strictly locked to UTC.

- **`events`:** `id`, `slug`, `name`, `start_date`, `end_date`, `description`, `location`, `is_public`, `created_at`.
- **`event_images`:** `id`, `event_id` (FK CASCADE), `image_url`, `display_order`, `created_at`.
- **`guests` (The Global Identity Vault):** `id` (UUID), `full_name`, `email` (UNIQUE), `phone`, `created_at`, `updated_at`.
- **`event_registrations` (The Event Junction):** `id` (UUID), `guest_id` (FK CASCADE), `event_id` (FK CASCADE), `access_code`, `id_number`, `id_document_url`, `dietary_restrictions`, `current_state`, `error_log`, `registered_at`. (Unique constraint on `guest_id` + `event_id` to prevent duplicate registrations).
- **`event_schedules` (The Itinerary Engine):** `id` (UUID), `event_id` (FK CASCADE), `title`, `description`, `speaker_name`, `location`, `start_time`, `end_time`, `created_at`, `updated_at`.

## Role-Based Access Control (RBAC)
The platform supports RBAC with isolated Organization nodes, specifically defined as:
- **Superadmins**
- **Tenant Admins**
- **Event Staff**

## Architectural Subsystems
- **Abyss Core:** An ephemeral state engine subsystem handling real-time features. It utilizes WebSockets (Socket.io) and Redis.

## Master Folder Structure
```
.
├── backend/    # API, Data Layer, Telemetry, and Websockets
└── frontend/   # Client-Side Architecture, Routing, and UI/UX Philosophy
```
