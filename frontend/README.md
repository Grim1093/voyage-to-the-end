# Frontend: Client-Side Architecture, Routing, and UI/UX Philosophy

## Setup & Start Instructions
Follow these steps to initialize the frontend environment and start the development server.

1. **Install Dependencies:**
   Navigate to the `/frontend` directory and install the necessary npm packages:
   ```bash
   cd frontend
   npm install
   ```

2. **Start the Development Server:**
   Run the Next.js development server:
   ```bash
   npm run dev
   ```
   The application will be accessible locally, typically at `http://localhost:3000`.

## Current Routing State
The frontend leverages the Next.js App Router to deliver a seamless, globally available structure.

- **Global Public Directory (`app/page.js`):** The landing page serving as a unified directory for all public events available on the MSaaS platform.
- **Control Plane (`app/admin/events/...`):** The administrative dashboard for the deployment, configuration, and editing of events.
- **Public Event Hub (`app/[eventSlug]/page.js`):** Dynamically generated, standalone pages for each individual event.

## GPU Optimizations Achieved
To realize our ultra-premium, cinematic aesthetic, performance is critical. We've optimized the frontend for hardware acceleration, offloading complex tasks to the GPU.

- **Eliminated Moving CSS Gaussian Blurs:** By removing computationally expensive CSS blurs, we significantly improved rendering performance and reduced jank during scrolling and transitions.
- **Concurrent Z-Index Fading:** We've implemented advanced z-index fading techniques for slideshows, allowing for smooth, visually stunning crossfades without layout thrashing.
- **`next/image` Compression:** Extensive use of Next.js's built-in image optimization ensures assets are served efficiently, minimizing load times without compromising visual fidelity.

## Animation Architecture
Our animation architecture is built entirely around Framer Motion, enabling complex, layout-aware animations that feel responsive and fluid.

- **Framer Motion Layout Transitions:** Utilizing `<AnimatePresence mode="popLayout">`, we achieve elegant entry and exit animations for components, maintaining a consistent, high-end feel as the UI state changes.
- **Bento Grid Layouts:** We employ bento grid structures to present information cleanly and hierarchically, often paired with subtle hover states and entry animations to create an engaging experience.
- **Ambient Aurora (`components/ui/ambient-aurora.js`):** A custom, hardware-accelerated, zero-blur radial gradient component that serves as the cinematic backdrop for our dark-mode aesthetic. This component provides dynamic, visually arresting backgrounds without the performance overhead of traditional CSS blurs.
