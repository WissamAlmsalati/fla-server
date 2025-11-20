## Orders Feature

- **Purpose:** Provide UI and API surface for listing, filtering, and inspecting orders and their statuses.
- **Structure:**
  - `slices/` contains Redux slice that caches orders from the server and exposes reducers for updates.
  - `hooks/` holds Zustand-powered UI utilities (filters, modal state).
  - `components/` will host tables, steppers, dashboards, etc.
  - `api/` may include shared helpers or service wrappers for fetching from `src/app/api/orders/route.ts`.

Follow the same pattern when you grow other feature folders.
