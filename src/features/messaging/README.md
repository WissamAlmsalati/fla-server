## Messaging Feature

- **Purpose:** Support customer ↔ admin conversations per order with delivery context.
- **Structure:**
  - `slices/` caches conversations and read statuses.
  - `hooks/` provide threads, selection, and busy indicators.
  - `components/` will include chat bubbles, forms, and attachments.
  - `api/` supplements `src/app/api/orders/[id]/messages`.
