## Shipments Feature

- **Purpose:** Manage shipment consolidations, weights, and warehouse transfers.
- **Structure:**
  - `slices/` caches shipments and their metadata.
  - `hooks/` provide UI state for selection, detail panels, and polling.
  - `components/` includes tables, forms, and progress indicators.
  - `api/` may house helpers for `src/app/api/shipments`.
